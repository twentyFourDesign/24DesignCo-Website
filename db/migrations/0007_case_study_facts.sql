-- Jara Beach Resort and Lufasi Lodges case studies: real build times and payment gateways, and the results
-- figures the founder chose not to publish are removed. Only applied while the seeded placeholders are still there.

update cms_projects set case_study = jsonb_set(jsonb_set(jsonb_set(case_study,
    '{stats}', (select coalesce(jsonb_agg(x order by n), '[]'::jsonb) from jsonb_array_elements(case_study->'stats') with ordinality t(x, n) where x->>0 not like '[%')
               || '[["12", "Weeks from the old booking system to a new property management system"]]'::jsonb),
    '{results}', '[]'::jsonb),
    '{run,stack}', '["MongoDB", "Express", "React", "Node.js", "Paystack", "Squadco", "Back office"]'::jsonb),
  updated_at = now()
where slug = 'jara-beach-resort' and case_study->'stats' @> '[["[X]", "Weeks from idea to launch"]]';

update cms_projects set case_study = jsonb_set(jsonb_set(jsonb_set(case_study,
    '{stats}', (select coalesce(jsonb_agg(x order by n), '[]'::jsonb) from jsonb_array_elements(case_study->'stats') with ordinality t(x, n) where x->>0 not like '[%')
               || '[["10", "Weeks from idea to launch"]]'::jsonb),
    '{results}', '[]'::jsonb),
    '{run,stack}', '["MongoDB", "Express", "React", "Node.js", "Paystack", "Squadco", "Admin dashboard"]'::jsonb),
  updated_at = now()
where slug = 'lufasi-lodges' and case_study->'stats' @> '[["[X]", "Weeks from idea to launch"]]';
