-- 008: skill descriptions, "currently exploring" notes, project year, and two new orderable sections.
-- Additive and idempotent: no data is changed or dropped. Run after schema.sql, 006 and 007.
alter table public.skills add column if not exists description text not null default '';
alter table public.projects add column if not exists year int;
alter table public.portfolio_settings add column if not exists exploring text[] not null default '{}';

do $$ declare c record; begin
  for c in select * from (values
    ('skills', 'skills_description_len', 'char_length(description) <= 120'),
    ('projects', 'projects_year_range', 'year is null or year between 2000 and 2100'),
    ('portfolio_settings', 'settings_exploring_limits', 'cardinality(exploring) <= 6 and char_length(array_to_string(exploring, ''|'')) <= 600')
  ) v(tbl, cname, expr) loop
    if not exists (select 1 from pg_constraint where conname = c.cname) then
      execute format('alter table public.%I add constraint %I check (%s)', c.tbl, c.cname, c.expr);
    end if;
  end loop;
end $$;

-- Allow the new section ids ('process', 'exploring') in section order / hidden sections.
alter table public.portfolio_settings drop constraint if exists portfolio_settings_section_order_check;
alter table public.portfolio_settings drop constraint if exists portfolio_settings_hidden_sections_check;
alter table public.portfolio_settings drop constraint if exists settings_section_order_ids;
alter table public.portfolio_settings drop constraint if exists settings_hidden_sections_ids;
alter table public.portfolio_settings
  add constraint settings_section_order_ids check (section_order <@ array['work','about','stack','process','experience','education','services','exploring','contact']),
  add constraint settings_hidden_sections_ids check (hidden_sections <@ array['work','about','stack','process','experience','education','services','exploring','contact']);
alter table public.portfolio_settings alter column section_order
  set default '{work,about,stack,process,experience,education,services,exploring,contact}';
