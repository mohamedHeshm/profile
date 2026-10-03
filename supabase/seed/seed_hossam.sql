-- Seed: Hossam Mohamed's real content, taken from his existing portfolio and GitHub README.
-- Run AFTER: schema.sql, 006, 007, and after creating the user hossam545mohamed@gmail.com
-- in Supabase (Authentication > Users). Non-destructive: each table is filled only if you have no rows in it yet.
-- Everything here is editable or deletable from the dashboard.
do $$
declare uid uuid;
begin
  select id into uid from auth.users where email = 'hossam545mohamed@gmail.com' limit 1;
  if uid is null then raise exception 'Create the auth user hossam545mohamed@gmail.com first (Authentication > Users).'; end if;

  insert into public.profiles (id, full_name, job_title, short_bio, full_bio, location, email, phone, avatar_url, resume_url, years_experience, available)
  values (uid, 'Hossam Mohamed', 'Angular Frontend Developer',
    'Angular Frontend Developer with PHP backend experience, building responsive, scalable applications with TypeScript. Exploring Data Engineering & Cybersecurity.',
    'Hi, I''m Hossam Mohamed Abd-alhakam, an Angular developer from Egypt, currently in my 3rd year at Cairo Higher Institute for Engineering and Computer Science. I build responsive, scalable applications that marry clean architecture with compelling design. Beyond frontend, I explore Data Engineering and Cybersecurity.',
    'Fayoum, Egypt', 'hossam545mohamed@gmail.com', '+20 10 15981677',
    'https://hossam-mohamed-abd.github.io/Portfolio/assets/images/me.jpeg',
    'https://hossam-mohamed-abd.github.io/Portfolio/assets/Hossam_CV_v2.pdf', 3, true)
  on conflict (id) do nothing;

  insert into public.portfolio_settings (owner_id, site_title, accent)
  values (uid, 'Hossam Mohamed | Angular Frontend Developer — Egypt', '#b4452c') on conflict (owner_id) do nothing;

  if not exists (select 1 from public.skills where owner_id = uid) then
    insert into public.skills (owner_id, category, name, featured, sort_order)
    select uid, category, name, featured, (row_number() over ())::int - 1 from (values
      ('Frontend','Angular',true),('Frontend','TypeScript',true),('Frontend','JavaScript ES6+',false),('Frontend','RxJS',true),('Frontend','HTML5',false),('Frontend','CSS3',false),
      ('Frontend','SCSS/Sass',false),('Frontend','Tailwind CSS',true),('Frontend','Bootstrap',false),('Frontend','Responsive',false),('Frontend','RTL support',false),('Frontend','Dark mode',false),
      ('Backend','PHP',true),('Backend','MVC',false),('Backend','RESTful APIs',false),('Backend','HTTPClient',false),
      ('Programming','Python',false),('Programming','JavaScript',false),('Programming','PHP',false),('Programming','SQL',false),
      ('Database','MySQL',false),('Database','Google Sheets API',false),
      ('DevOps / Tools','Git',false),('DevOps / Tools','GitHub',false),('DevOps / Tools','Docker',false),('DevOps / Tools','Linux',false),('DevOps / Tools','Figma',false),('DevOps / Tools','Jasmine/Karma',false),
      ('Security','Web Security',false),('Security','OWASP Top 10',false),('Security','XSS/CSRF',false),
      ('Data / AI','Python',false),('Data / AI','Qwen AI API',false),('Data / AI','Google Sheets API',false),
      ('Practices','Component-based',false),('Practices','Agile',false),('Practices','Clean Code',false)
    ) v(category, name, featured);
  end if;

  if not exists (select 1 from public.projects where owner_id = uid) then
    insert into public.projects (owner_id, slug, title, category, summary, description, features, technologies, github_url, featured, published, sort_order)
    select uid, slug, title, category, summary, description, features, technologies, github_url, featured, true, sort_order from (values
      ('snovaverse','SnovaVerse','Company website','Futuristic company website for VR/AR/AI services.',
        'Futuristic company website for VR/AR/AI services. Full AR/EN bilingual support, RTL direction, animated hero section, and Formspree contact integration.',
        E'Full AR/EN bilingual support\nRTL direction\nAnimated hero section\nFormspree contact integration', array['Angular','Tailwind CSS','i18n AR/EN','RTL'], null, true, 0),
      ('psychology-clinic','Psychology Clinic','Bilingual website','Full bilingual clinic website with appointment booking, patient reviews and session pricing.',
        'Bilingual clinic site with appointment booking, patient reviews, session pricing, Facebook-integrated articles, and embedded videos.',
        E'Appointment booking\nPatient reviews\nSession pricing\nFacebook-integrated articles\nEmbedded videos', array['Angular','Dark Mode','i18n AR/EN'], null, false, 1),
      ('gdg-student-system','GDG Student System','Full-stack system','Full-stack track management for GDG communities.',
        'Full-stack track management for GDG communities: sessions, attendance, assignments, grades, OTP auth, and SQL injection prevention via prepared statements.',
        E'Sessions and attendance\nAssignments and grades\nOTP authentication\nSQL injection prevention via prepared statements', array['PHP','MySQL','OTP Auth'], null, false, 2),
      ('e-commerce-app','E-Commerce App','Angular application','Angular e-commerce app with REST API integration and a clean component-based architecture.',
        'Angular e-commerce app with product listing, filtering, shopping cart, and full REST API integration using clean component-based architecture.',
        E'Product listing\nFiltering\nShopping cart\nREST API integration', array['Angular','REST APIs','Tailwind CSS'], 'https://github.com/hossam-mohamed-abd', false, 3),
      ('grand-egyptian-museum','Grand Egyptian Museum','Full-stack portal','Alternative full-stack portal for the Grand Egyptian Museum.',
        'Alternative full-stack portal for GEM with user authentication, dynamic content management, and clean MVC architecture.',
        E'User authentication\nDynamic content management\nClean MVC architecture', array['PHP','MySQL','MVC'], 'https://github.com/hossam-mohamed-abd', false, 4),
      ('asktrack','AskTrack','AI learning platform','Study-focused AI platform using the Qwen AI API, with Google Sheets as a lightweight backend.',
        'Study-focused AI platform using Qwen AI API for intelligent responses, with Google Sheets as a lightweight backend.',
        E'Qwen AI API responses\nGoogle Sheets as backend', array['Qwen AI','Google Sheets API','JavaScript'], 'https://github.com/hossam-mohamed-abd', false, 5),
      ('quback','QuBack','AI learning platform','Multi-device learning platform with an AI assistant, personalized learning paths and community modules.',
        'Multi-device learning platform with AI assistant, personalized learning paths, and community modules, focused on strong UX/UI.',
        E'AI assistant\nPersonalized learning paths\nCommunity modules\nMulti-device', array['Angular','AI Integration'], 'https://github.com/hossam-mohamed-abd', false, 6)
    ) v(slug, title, category, summary, description, features, technologies, github_url, featured, sort_order);
  end if;

  -- Courses and certifications are stored as Education entries: issuer in "University", title in "Degree".
  if not exists (select 1 from public.education where owner_id = uid) then
    insert into public.education (owner_id, institution, degree, field, sort_order)
    select uid, institution, degree, field, (row_number() over ())::int - 1 from (values
      ('Cairo Higher Institute for Engineering and Computer Science','B.Sc. Computer Science','3rd year'),
      ('Meta · Coursera','Meta Front-End Developer Professional Certificate',''),
      ('Route Academy (2025)','Front-End Development',''),
      ('ITIDA · NTI','Full Stack Web Development using PHP',''),
      ('Manara Platform','Front-End Web Development',''),
      ('CompTIA · LinkedIn Learning','Getting Started as a Full-Stack Web Developer',''),
      ('LinkedIn Learning','Node.js Essential Training',''),
      ('LinkedIn Learning','Introduction to Web Design and Development',''),
      ('National Telecommunication Institute (NTI)','Cyber Security Course',''),
      ('GDG On Campus · Arab Open University','GDG Cyber Security, Certificate of Appreciation','')
    ) v(institution, degree, field);
  end if;

  if not exists (select 1 from public.social_links where owner_id = uid) then
    insert into public.social_links (owner_id, platform, url, sort_order) values
      (uid,'GitHub','https://github.com/hossam-mohamed-abd',0),(uid,'LinkedIn','https://www.linkedin.com/in/hossam-mohamed-abd/',1),
      (uid,'Facebook','https://www.facebook.com/hossam2512es',2),(uid,'X','https://x.com/Hosam545Mohamed',3),(uid,'Instagram','https://www.instagram.com/hossam_mohamed_abd',4);
  end if;
end $$;
