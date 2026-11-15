-- Nexuss case study: real app screenshots. The family tree and the "weave" timeline go beside their sections,
-- four more phone screens form a gallery, and the admin review queue and memorable dates join the web app shots.
-- Only applied while the seeded "[Family tree screenshot]" placeholder is still there.

update cms_projects set case_study = jsonb_set(jsonb_set(jsonb_set(case_study,
    '{design,features}', (select jsonb_agg(case f->>'shot'
        when '[Family tree screenshot]' then f || '{"shot": "/work/nexuss/app-tree.jpg"}'::jsonb
        when '[Timeline and country history screenshot]' then f || '{"shot": "/work/nexuss/app-person-weave.jpg"}'::jsonb
        else f end order by n) from jsonb_array_elements(case_study->'design'->'features') with ordinality t(f, n))),
    '{design,gallery}', $j${"title": "The mobile app, screen by screen", "phone": true, "shots": [["First screen: one name starts the tree", "/work/nexuss/app-onboarding.jpg"], ["Home: what to add next", "/work/nexuss/app-home.jpg"], ["Archive: official history and family records", "/work/nexuss/app-archive.jpg"], ["Time Capsule: a message that opens in a chosen year", "/work/nexuss/app-time-capsule.jpg"]]}$j$::jsonb),
    '{extra,shots}', coalesce(case_study->'extra'->'shots', '[]'::jsonb) || '[["Admin review queue", "/work/nexuss/web-review-queue.jpg"], ["Memorable dates", "/work/nexuss/web-memorable-dates.jpg"]]'::jsonb),
  updated_at = now()
where slug = 'nexuss' and case_study::text like '%[Family tree screenshot]%';
