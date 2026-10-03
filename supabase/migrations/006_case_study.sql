-- 006: case-study fields, project slug/logo, resume link.
-- Additive and idempotent: no data is changed or dropped, RLS stays enabled, and the existing
-- policies already cover the new columns. Run after schema.sql.
alter table public.projects
  add column if not exists slug text,
  add column if not exists category text not null default '',
  add column if not exists problem text not null default '',
  add column if not exists features text not null default '',
  add column if not exists architecture text not null default '',
  add column if not exists decisions text not null default '',
  add column if not exists logo_url text;
alter table public.profiles add column if not exists resume_url text;

do $$ declare c record; begin
  for c in select * from (values
    ('projects', 'projects_slug_format', 'slug is null or (char_length(slug) <= 60 and slug ~ ''^[a-z0-9]+(-[a-z0-9]+)*$'')'),
    ('projects', 'projects_category_len', 'char_length(category) <= 60'),
    ('projects', 'projects_case_len', 'char_length(problem) <= 3000 and char_length(features) <= 3000 and char_length(architecture) <= 3000 and char_length(decisions) <= 3000'),
    ('projects', 'projects_logo_url_http', 'logo_url is null or logo_url ~ ''^https?://'''),
    ('profiles', 'profiles_resume_url_http', 'resume_url is null or resume_url ~ ''^https?://''')
  ) v(tbl, cname, expr) loop
    if not exists (select 1 from pg_constraint where conname = c.cname) then
      execute format('alter table public.%I add constraint %I check (%s)', c.tbl, c.cname, c.expr);
    end if;
  end loop;
end $$;

create unique index if not exists projects_owner_slug_key on public.projects(owner_id, slug) where slug is not null;

-- New portfolios start in story order (only affects rows created after this runs).
alter table public.portfolio_settings alter column section_order
  set default '{work,stack,about,experience,education,services,contact}';
