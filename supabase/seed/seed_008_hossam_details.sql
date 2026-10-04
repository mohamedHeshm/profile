-- Optional: short descriptions for Hossam's skills and his "currently exploring" list (from his GitHub profile).
-- Run after 008. Never overwrites descriptions or notes you already wrote.
do $$
declare uid uuid;
begin
  select id into uid from auth.users where email = 'hossam545mohamed@gmail.com' limit 1;
  if uid is null then raise exception 'Create the auth user hossam545mohamed@gmail.com first.'; end if;

  update public.skills s set description = d.t
  from (values
    ('Angular','Component-based web applications'),('TypeScript','Typed application code'),('JavaScript ES6+','Modern language features'),
    ('RxJS','Reactive data streams'),('HTML5','Semantic markup'),('CSS3','Layout and styling'),('SCSS/Sass','Structured stylesheets'),
    ('Tailwind CSS','Utility-first styling'),('Bootstrap','Responsive UI framework'),('PHP','Server-side applications'),('MVC','Separation of concerns'),
    ('RESTful APIs','Client-server data exchange'),('MySQL','Relational data'),('Git','Version control'),('GitHub','Collaboration and hosting'),
    ('Docker','Containerized environments'),('Linux','Command-line workflow'),('Figma','Interface design'),('Python','Scripting and data work'),
    ('Web Security','Secure-by-default practices'),('OWASP Top 10','Common web vulnerabilities'),('XSS/CSRF','Injection and forgery defenses')
  ) d(n, t)
  where s.owner_id = uid and s.name = d.n and s.description = '';

  update public.portfolio_settings set exploring = array['Data Engineering','Cybersecurity','Penetration Testing']
  where owner_id = uid and exploring = '{}';
end $$;
