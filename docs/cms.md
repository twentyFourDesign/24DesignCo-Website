# The website CMS (built into this Next.js site)

The admin lives at `/admin` in the same app as the public website. Content, bookings, users and uploaded files are stored in the
Neon Postgres database. There is no separate backend.

## Run it

```bash
npm run db:migrate    # creates the tables (db/migrations/*.sql, safe to re-run)
npm run db:seed       # first owner account + starting content
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
| Editor | Pages, blog (publish), Our Work, team, media, bookings |
| Author | Writes blog drafts and sends them for review; cannot publish |

## Deploy (Vercel + Neon)

1. In Vercel → Project → Settings → Environment Variables add: `DATABASE_URL` (Neon pooled connection string), `AUTH_SECRET`
   (32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`), and `SITE_URL=https://24group.com.ng`.
   Optional: `SMTP_URL`, `MAIL_FROM`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_IMPERSONATE_USER`.
2. Once, from your machine with `.env.local` pointing at Neon: `npm run db:migrate && npm run db:seed`
   (creates tables, the owner account — a temporary password is printed once — and the starting content). Safe to re-run.
3. Deploy. Sign in at `/admin`, then change the owner password under Profile.

Uploaded images live in the database (cms_media). The free Neon plan has 0.5 GB, which is plenty for a marketing site; move to object storage if the media library grows large.
