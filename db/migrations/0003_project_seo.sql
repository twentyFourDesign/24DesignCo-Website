alter table cms_projects add column if not exists seo jsonb not null default '{}';
