-- CMS schema for the 24 Design Co. website. Everything lives in the Neon database: content, bookings, users and uploaded files.
create extension if not exists pgcrypto;

create table if not exists cms_users (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null,
  role text not null default 'editor' check (role in ('owner','admin','editor','author')),
  password_hash text,
  status text not null default 'invited' check (status in ('invited','active','disabled')),
  invite_token_hash text,
  invite_expires_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists cms_users_email_key on cms_users (lower(email));
create index if not exists cms_users_invite_idx on cms_users (invite_token_hash);

create table if not exists cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null unique,
  status text not null default 'draft' check (status in ('draft','published')),
  sections jsonb not null default '[]',
  published_sections jsonb not null default '[]',
  seo jsonb not null default '{}',
  published_seo jsonb not null default '{}',
  has_unpublished_changes boolean not null default false,
  published_at timestamptz,
  updated_by uuid references cms_users(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'How to build',
  author_id uuid references cms_users(id) on delete set null,
  author_name text not null default '',
  status text not null default 'draft' check (status in ('draft','review','scheduled','published')),
  published_at timestamptz,
  featured_image text not null default '',
  featured_image_alt text not null default '',
  cta_heading text not null default 'Want to talk through your idea?',
  seo jsonb not null default '{}',
  keywords text[] not null default '{}',
  related text[] not null default '{}',
  featured boolean not null default false,
  faq_schema boolean not null default true,
  show_in_keep_reading boolean not null default true,
  reading_minutes int not null default 1,
  word_count int not null default 0,
  updated_by uuid references cms_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_posts_status_idx on cms_posts (status, published_at desc);

create table if not exists cms_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'case-study' check (type in ('case-study','partnership')),
  summary text not null default '',
  services text[] not null default '{}',
  logo text not null default '',
  cover_image text not null default '',
  body text not null default '',
  links jsonb not null default '{}',
  case_study jsonb,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_team (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  short_bio text not null default '',
  bio text not null default '',
  research_area text not null default '',
  photo text not null default '',
  photo_alt text not null default '',
  links jsonb not null default '{}',
  is_founder boolean not null default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_media (
  id uuid primary key default gen_random_uuid(),
  filename text not null unique,
  original_name text not null,
  mime_type text not null,
  size int not null,
  width int,
  height int,
  alt text not null default '',
  folder text not null default 'Other',
  data bytea not null,
  uploaded_by uuid references cms_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists cms_media_folder_idx on cms_media (folder, created_at desc);

create table if not exists cms_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  company text not null default '',
  idea text not null,
  stage text not null default 'Just an idea',
  budget text not null default 'Not sure yet',
  source text not null default '',
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','completed','cancelled','no-show')),
  notes text not null default '',
  meet_link text not null default '',
  calendar_event_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_bookings_start_idx on cms_bookings (start_at);

create table if not exists cms_settings (
  singleton text primary key default 'site',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists cms_activity (
  id bigserial primary key,
  user_id uuid references cms_users(id) on delete set null,
  user_name text,
  kind text not null,
  action text not null,
  subject text not null default '',
  link text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists cms_activity_created_idx on cms_activity (created_at desc);

-- Fixed-window counters for rate limits (login attempts, booking attempts), safe across serverless instances.
create table if not exists cms_rate (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);
