-- Fills two placeholders on pages that still carry the seeded text (anything already edited in the admin is left alone):
--   Our Work: the three brand and design cards get a logo, a label and a description.
--   Discovery Sprint: "Starting from [price]" becomes a budget-based price card.

create or replace function pg_temp.fill_brands(secs jsonb) returns jsonb language sql as $$
  select coalesce(jsonb_agg(
    case when s->>'type' = 'cards' and s::text like '%[What you did.]%' then
      jsonb_set(s, '{fields,items}', (
        select jsonb_agg(
          case
            when it->>'text' <> '[What you did.]' then it
            when lower(it->>'title') = 'ileri labs' then it || jsonb_build_object(
              'title', 'Ileri Labs', 'label', 'BRAND AND WEBSITE', 'image', '/work/brands/ileri-labs.svg', 'imageAlt', 'Ileri Labs logo',
              'text', 'Brand identity and website for Nigeria’s pioneering organic private label manufacturer, which formulates and packages natural skincare and haircare for beauty brands.')
            when it->>'title' = 'Grillz & Moore' then it || jsonb_build_object(
              'label', 'BRAND, WEBSITE AND ORDERING', 'image', '/work/brands/grillz-and-moore.jpg', 'imageAlt', 'Grillz & Moore logo',
              'text', 'Brand identity and a website with an online food ordering system for this grill restaurant.')
            when it->>'title' = 'EveryCation' then it || jsonb_build_object(
              'label', 'BRAND, WEBSITE AND APP', 'image', '/work/brands/everycation.svg', 'imageAlt', 'EveryCation logo',
              'text', 'Taken from idea to MVP: brand identity, website and mobile app.')
            else it
          end order by n)
        from jsonb_array_elements(s->'fields'->'items') with ordinality as x(it, n)))
    else s end order by i), secs)
  from jsonb_array_elements(secs) with ordinality as y(s, i)
$$;

create or replace function pg_temp.fill_price(secs jsonb) returns jsonb language sql as $$
  select coalesce(jsonb_agg(
    case when s->>'type' = 'cards' and s::text like '%Starting from [price]%' then
      jsonb_set(s, '{fields,items}', (
        select jsonb_agg(
          case when it->>'title' = 'Starting from [price]' then it || jsonb_build_object(
            'title', 'Sized to your budget',
            'text', 'Tell us your budget on the free idea review. We shape the sprint to fit it and agree a fixed price before we start, credited toward your build if you go ahead with us.')
          else it end order by n)
        from jsonb_array_elements(s->'fields'->'items') with ordinality as x(it, n)))
    else s end order by i), secs)
  from jsonb_array_elements(secs) with ordinality as y(s, i)
$$;

update cms_pages set
  sections = pg_temp.fill_brands(sections),
  published_sections = case when published_sections is null then null else pg_temp.fill_brands(published_sections) end,
  updated_at = now()
where path = '/our-work' and (sections::text like '%[What you did.]%' or coalesce(published_sections::text, '') like '%[What you did.]%');

update cms_pages set
  sections = pg_temp.fill_price(sections),
  published_sections = case when published_sections is null then null else pg_temp.fill_price(published_sections) end,
  updated_at = now()
where path = '/services/discovery-sprint' and (sections::text like '%Starting from [price]%' or coalesce(published_sections::text, '') like '%Starting from [price]%');
