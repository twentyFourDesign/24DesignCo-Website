-- Extra Our Work fields: the small label above a project's name ("BOOKING PLATFORM · ONGOING CTO SUPPORT") and its headline numbers.
alter table cms_projects add column if not exists tag text not null default '';
alter table cms_projects add column if not exists stats jsonb not null default '[]';
