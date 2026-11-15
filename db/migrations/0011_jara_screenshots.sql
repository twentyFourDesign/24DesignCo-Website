-- Jara Beach Resort case study: real screenshots of the guest booking site (in public/work/jara), the five booking
-- steps as they are in the live product, and the rooms screenshot for "Dates and rooms".
-- Only applied while the seeded "[Dates and rooms screenshot]" placeholder is still there.

update cms_projects set case_study = jsonb_set(jsonb_set(jsonb_set(jsonb_set(case_study,
    '{design,body}', to_jsonb($t$Guests pick how they're coming, then move through five clear steps. A booking panel follows them the whole way, so they always know what they've chosen and what it costs.$t$::text)),
    '{design,steps}', $j$[["Step 1", "Guests", "Who's coming, with children's ages to set the price and which rooms fit."], ["Step 2", "Dates and room", "Available dates first, then the rooms free for them."], ["Step 3", "Food and drinks", "Meal and drinks packages added before arrival."], ["Step 4", "Extras", "Spa, experiences and activities, each with a day and time."], ["Step 5", "Your details", "Contact details and a photo ID, to speed up check-in."]]$j$::jsonb),
    '{design,gallery}', $j${"title": "The guest side, screen by screen", "shots": [["Home: four ways to book", "/work/jara/home.jpg"], ["Overnight stay: who's coming", "/work/jara/guests.jpg"], ["Day pass: date, rates and extras", "/work/jara/day-pass-date-extras.jpg"], ["Extras: a day and time for each", "/work/jara/extras.jpg"], ["Your details: photo ID before arrival", "/work/jara/day-pass-details.jpg"]]}$j$::jsonb),
    '{design,features}', (select jsonb_agg(case when f->>'shot' = '[Dates and rooms screenshot]' then f || '{"shot": "/work/jara/rooms.jpg"}'::jsonb else f end order by n)
                          from jsonb_array_elements(case_study->'design'->'features') with ordinality t(f, n))),
  updated_at = now()
where slug = 'jara-beach-resort' and case_study::text like '%[Dates and rooms screenshot]%';
