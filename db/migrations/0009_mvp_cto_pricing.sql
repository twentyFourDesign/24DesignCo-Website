-- MVP Development and CTO as a Service: prices are agreed per founder, so "[price]" becomes "Sized to your budget",
-- and the CTO plan terms are filled in (6 month minimum, 30 days notice, 10 development hours a month).
-- Plain text replacements, so anything already edited in the admin is left alone.

create or replace function pg_temp.fill_pricing(t text) returns text language sql as $$
  select replace(replace(replace(replace(t,
    '"From [price]"', '"Sized to your budget"'),
    '"[price] a month"', '"Sized to your budget"'),
    '[6 or 12] month minimum. [60 to 90] days notice to end.', '6 month minimum. 30 days notice to end. We agree the monthly fee with you on the free idea review.'),
    'plus [X] development hours and roadmap planning', 'plus 10 development hours a month and roadmap planning')
$$;

update cms_pages set
  sections = pg_temp.fill_pricing(sections::text)::jsonb,
  published_sections = pg_temp.fill_pricing(published_sections::text)::jsonb,
  updated_at = now()
where path in ('/services/mvp-development', '/services/cto-as-a-service')
  and (sections::text ~ '\[(price|X|6 or 12)\]' or published_sections::text ~ '\[(price|X|6 or 12)\]');
