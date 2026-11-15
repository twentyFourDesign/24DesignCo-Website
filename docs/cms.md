# The website CMS (built into this Next.js site)

The admin lives at `/admin` in the same app as the public website. Content, bookings, users and uploaded files are stored in the
Neon Postgres database. There is no separate backend.

## Run it

```bash
npm run db:migrate    # creates the tables (db/migrations/*.sql, safe to re-run)
npm run db:seed       # first owner account + starting content (never overwrites edits made in the admin)
npm run dev           # site on :3000, admin on :3000/admin
```

Environment (`.env.local`, never committed): `DATABASE_URL` (Neon pooled string), `AUTH_SECRET` (32+ random chars), and optionally
`OWNER_EMAIL`, `OWNER_NAME`, `OWNER_PASSWORD`, `SMTP_URL`, `MAIL_FROM`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_IMPERSONATE_USER`.

## Conventions (every module follows these)

- **Database**: `import { sql } from "@/lib/cms/db"`. Postgres.js tagged templates; columns are camelCased on the way out
  (`start_at` → `startAt`). Tables are `cms_*` (see `db/migrations`). Add new migrations as `000N_name.sql`; never edit applied ones.
- **API**: route handlers under `app/api/cms/<area>/…` wrapped in `api()` from `lib/cms/http.ts` (throw `HttpError`/`badRequest`/`notFound`
  for errors). Guard with `await requireApi("editor")` etc. (`lib/cms/auth.ts`). Roles: author < editor < admin < owner.
  Public (no sign-in) endpoints live under `app/api/public/…`.
- **Admin pages**: `app/admin/(app)/<area>/…`. Server components call `await requireUser("editor")` first. Interactive parts are
  client components that call the API with `apiFetch` (`lib/cms/client.ts`) and report with `useToast()` (`components/cms/Toast.tsx`).
- **UI kit**: `components/cms/ui/*` (copied from the booking-hub dashboard): `PageHeader`, `Tabs`, `Card`, `Stat`, `Badge`, `StatusBadge`,
  `Callout`, `EmptyState`, `Table/Th/Td/Tr`, `Field/Input/Textarea/Select/Check/FormGrid`, `Modal`, `Button`/`ButtonLink`, `FilterMenu`, `DatePicker`,
  `TagInput`, `Combo`, skeletons. Use semantic Tailwind colours only (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-accent`, `text-bad`, …) so
  light and dark themes both work. Look at `components/cms/ui/core.tsx` and the existing screens before inventing styles.
- **Public site cache**: public readers use `"use cache"` + `cacheLife` + `cacheTag(TAGS.x)` (`lib/cms/revalidate.ts`). Every admin write that changes
  public content ends with `bust(TAGS.x)`.
- **Files**: uploads are stored in `cms_media.data` (bytea) and served from `/media/<id>/<filename>`.
- **Next.js 16 with cacheComponents**: reading cookies/params/DB at request time must sit under a `<Suspense>` (the admin layout already provides one).
  Read `node_modules/next/dist/docs/` before using an API you are unsure of; this is not the Next.js you know.
- **Never** put secrets in client code or commit `.env*`.

## Roles

| Role | Can do |
| --- | --- |
| Owner | Everything, including adding admins |
| Admin | All content and settings; manages editors and authors |
| Editor | Pages, blog (publish), Our Work, team, media, bookings, messages |
| Author | Writes blog drafts and sends them for review; cannot publish |

## Deploy (Vercel + Neon)

1. In Vercel → Project → Settings → Environment Variables add: `DATABASE_URL` (Neon pooled connection string), `AUTH_SECRET`
   (32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`), and `SITE_URL=https://24group.com.ng`.
   Optional: `SMTP_URL`, `MAIL_FROM`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_IMPERSONATE_USER`.
2. Once, from your machine with `.env.local` pointing at Neon: `npm run db:migrate && npm run db:seed`
   (creates tables, the owner account — a temporary password is printed once — and the starting content). Safe to re-run.
3. Deploy. Sign in at `/admin`, then change the owner password under Profile.

Uploaded images live in the database (cms_media). The free Neon plan has 0.5 GB, which is plenty for a marketing site; move to object storage if the media library grows large.

## Re-running the seed

`npm run db:seed` only adds what is missing. Pages, articles and projects already in the database are left alone, so edits
made in the admin are safe. To replace the 8 articles with the files in `content/blog` (losing admin edits to them), run
`npx tsx scripts/seed-blog.ts --force`.

## Messages (contact form)

The "Prefer to write?" form on /contact posts to `/api/public/contact`. Each message is saved in `cms_messages` (admin:
Messages, with an unread count in the menu) and emailed to the address set at the top of that screen (default
wole@24group.com.ng). Emails need `SMTP_URL` and `MAIL_FROM`; without them messages are still saved and the screen says so.
The endpoint takes 5 messages an hour per visitor and turns away bots through a hidden field.

## Uploads

Vercel refuses any request over 4.5 MB, so the admin sends files one at a time and refuses files over 4 MB with a clear
message. Resize large photos before uploading (2000 px on the long side is plenty for the website).

## Not-found pages

`proxy.ts` checks each public address against the published pages, articles and case studies and returns a real 404
status for unknown ones (pages stream inside Suspense, so they cannot change the status themselves). Its list is cached
for 30 seconds and an unknown address is checked once more before it gets a 404, so new content works immediately.

## Sessions

A session carries the user's `session_version`. Changing a password or disabling an account bumps it, which signs that
person out everywhere else. Builds read content from the database, so preview deployments also need `DATABASE_URL`.
