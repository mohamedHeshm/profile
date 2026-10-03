-- 007: contact form messages + public phone number. Additive and idempotent. Run after schema.sql and 006.
alter table public.profiles add column if not exists phone text not null default '';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_phone_format') then
    alter table public.profiles add constraint profiles_phone_format check (char_length(phone) <= 30 and phone ~ '^[+0-9 ()-]*$');
  end if;
end $$;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null check (char_length(email) <= 120 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  subject text not null check (char_length(btrim(subject)) between 1 and 120),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now());
create index if not exists contact_messages_created on public.contact_messages(created_at desc);
alter table public.contact_messages enable row level security;

-- Visitors can only INSERT (never read). Only the portfolio owner can read, mark read, or delete.
drop policy if exists "contact insert public" on public.contact_messages;
drop policy if exists "contact owner read" on public.contact_messages;
drop policy if exists "contact owner update" on public.contact_messages;
drop policy if exists "contact owner delete" on public.contact_messages;
create policy "contact insert public" on public.contact_messages for insert to anon, authenticated with check (is_read = false);
create policy "contact owner read" on public.contact_messages for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));
create policy "contact owner update" on public.contact_messages for update to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())))
  with check (exists (select 1 from public.profiles where id = (select auth.uid())));
create policy "contact owner delete" on public.contact_messages for delete to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));
