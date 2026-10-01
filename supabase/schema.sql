-- =====================================================================
-- Portfolio database: complete schema in one file (tables, RLS, storage,
-- analytics). Run once in the Supabase SQL Editor. Safe to re-run: it never
-- drops tables or data, and it replaces policies and triggers by name.
-- Client code only ever uses the anon key.
-- =====================================================================

-- ---------- Helpers ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 80),
  username text unique check (username is null or char_length(username) between 3 and 30),
  job_title text not null default '' check (char_length(job_title) <= 80),
  short_bio text not null default '' check (char_length(short_bio) <= 200),
  full_bio text not null default '' check (char_length(full_bio) <= 2000),
  location text not null default '' check (char_length(location) <= 80),
  email text not null default '' check (char_length(email) <= 254),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https?://'),
  years_experience int check (years_experience between 0 and 60),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  category text not null check (char_length(category) between 1 and 60),
  featured boolean not null default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  summary text not null default '' check (char_length(summary) <= 200),
  description text not null default '' check (char_length(description) <= 5000),
  role text not null default '' check (char_length(role) <= 200),
  challenges text not null default '' check (char_length(challenges) <= 3000),
  solutions text not null default '' check (char_length(solutions) <= 3000),
  results text not null default '' check (char_length(results) <= 3000),
  image_url text check (image_url is null or image_url ~ '^https?://'),
  technologies text[] not null default '{}' check (cardinality(technologies) <= 30),
  github_url text check (github_url is null or github_url ~ '^https?://'),
  live_url text check (live_url is null or live_url ~ '^https?://'),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null check (image_url ~ '^https?://'),
  sort_order int not null default 0,
  created_at timestamptz not null default now());

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company text not null check (char_length(company) between 1 and 120),
  position text not null check (char_length(position) between 1 and 120),
  location text not null default '' check (char_length(location) <= 80),
  start_date date,
  end_date date,
  current boolean not null default false,
  description text not null default '' check (char_length(description) <= 2000),
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date));

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null check (char_length(institution) between 1 and 120),
  degree text not null default '' check (char_length(degree) <= 120),
  field text not null default '' check (char_length(field) <= 120),
  start_date date,
  end_date date,
  description text not null default '' check (char_length(description) <= 2000),
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date));

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (char_length(platform) between 1 and 40),
  url text not null check (url ~ '^(https?://|mailto:)'),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.portfolio_settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  site_title text not null default '' check (char_length(site_title) <= 80),
  hero_text text not null default '' check (char_length(hero_text) <= 160),
  accent text not null default '#2b5c8a' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  logo_url text check (logo_url is null or logo_url ~ '^https?://'),
  favicon_url text check (favicon_url is null or favicon_url ~ '^https?://'),
  section_order text[] not null default '{work,about,services,experience,education,stack,contact}'
    check (section_order <@ array['work','about','services','experience','education','stack','contact']),
  hidden_sections text[] not null default '{}'
    check (hidden_sections <@ array['work','about','services','experience','education','stack','contact']),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());

create table if not exists public.portfolio_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 200),
  viewed_at timestamptz not null default now());

-- ---------- Upgrade path (no-ops on a fresh database) ----------
alter table public.projects
  add column if not exists role text not null default '',
  add column if not exists challenges text not null default '',
  add column if not exists solutions text not null default '',
  add column if not exists results text not null default '';
alter table public.portfolio_settings
  add column if not exists hero_text text not null default '',
  add column if not exists logo_url text,
  add column if not exists favicon_url text;

-- ---------- Indexes and updated_at triggers ----------
create index if not exists project_images_project_sort on public.project_images(project_id, sort_order);
create index if not exists portfolio_views_viewed_at on public.portfolio_views(viewed_at);

do $$ declare t text; begin
  foreach t in array array['skills','projects','experiences','education','services','social_links'] loop
    execute format('create index if not exists %I on public.%I(owner_id, sort_order)', t || '_owner_sort', t);
  end loop;
  foreach t in array array['profiles','skills','projects','experiences','education','services','social_links','portfolio_settings'] loop
    execute format('drop trigger if exists %I on public.%I', 'touch_' || t, t);
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', 'touch_' || t, t);
  end loop;
end $$;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.services enable row level security;
alter table public.social_links enable row level security;
alter table public.portfolio_settings enable row level security;
alter table public.portfolio_views enable row level security;

-- Profiles: public read. Only the FIRST account may create a profile (single-owner portfolio),
-- so leaving public sign-ups on cannot create a second owner. Users only touch their own row.
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles public read" on public.profiles;
drop policy if exists "profiles insert owner only" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles insert owner only" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()) and not exists (select 1 from public.profiles p where p.id <> (select auth.uid())));
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles delete own" on public.profiles for delete to authenticated using (id = (select auth.uid()));

-- Owner-scoped tables: owner can do everything; visitors read only visible/published rows.
drop policy if exists "settings public read" on public.portfolio_settings;
drop policy if exists "settings write own" on public.portfolio_settings;
do $$ declare t text; begin
  foreach t in array array['skills','projects','experiences','education','services','social_links','portfolio_settings'] loop
    execute format('drop policy if exists %I on public.%I', t || ' write own', t);
    execute format('create policy %I on public.%I for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t || ' write own', t);
  end loop;
  foreach t in array array['skills','experiences','education','services'] loop
    execute format('drop policy if exists %I on public.%I', t || ' read visible or own', t);
    execute format('create policy %I on public.%I for select using (visible or owner_id = (select auth.uid()))', t || ' read visible or own', t);
  end loop;
  foreach t in array array['social_links','portfolio_settings'] loop
    execute format('drop policy if exists %I on public.%I', t || ' public read', t);
    execute format('create policy %I on public.%I for select using (true)', t || ' public read', t);
  end loop;
end $$;

drop policy if exists "projects read published or own" on public.projects;
create policy "projects read published or own" on public.projects for select
  using (published or owner_id = (select auth.uid()));

-- Gallery: readable only when the parent project is; writable only on projects you own (prevents IDOR).
drop policy if exists "gallery read if project visible" on public.project_images;
drop policy if exists "gallery insert own project" on public.project_images;
drop policy if exists "gallery update own" on public.project_images;
drop policy if exists "gallery delete own" on public.project_images;
create policy "gallery read if project visible" on public.project_images for select
  using (exists (select 1 from public.projects p where p.id = project_images.project_id and (p.published or p.owner_id = (select auth.uid()))));
create policy "gallery insert own project" on public.project_images for insert to authenticated
  with check (owner_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_images.project_id and p.owner_id = (select auth.uid())));
create policy "gallery update own" on public.project_images for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_images.project_id and p.owner_id = (select auth.uid())));
create policy "gallery delete own" on public.project_images for delete to authenticated using (owner_id = (select auth.uid()));

-- Analytics: views are written only through record_view(); only the owner can read them.
drop policy if exists "views read by owner" on public.portfolio_views;
create policy "views read by owner" on public.portfolio_views for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));
create or replace function public.record_view(p_path text) returns void
language sql security definer set search_path = public as
$$ insert into public.portfolio_views(path) values (left(coalesce(nullif(p_path, ''), '/'), 200)) $$;
revoke all on function public.record_view(text) from public;
grant execute on function public.record_view(text) to anon, authenticated;

-- ---------- Storage: bucket "media" ----------
-- Public bucket (files are served by URL), 5 MB, images only. Authenticated users can read,
-- write and delete only inside their own <user-id>/ folder, and cannot list other users' files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media owner read" on storage.objects;
drop policy if exists "media insert own folder" on storage.objects;
drop policy if exists "media update own folder" on storage.objects;
drop policy if exists "media delete own folder" on storage.objects;
create policy "media owner read" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
