# 24 Design Co. website

The public website for [24group.com.ng](https://24group.com.ng) and its admin (at `/admin`), in one Next.js app. Content,
bookings, messages, users and uploads live in a Neon Postgres database.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev                  # site on http://localhost:3000, admin on /admin
```

## Environment variables

| Name | What it is |
| --- | --- |
| `DATABASE_URL` | Neon connection string. Needed for builds too (pages are built from the database). |
| `AUTH_SECRET` | Long random string that signs admin sessions. Changing it signs everyone out. |
| `OWNER_EMAIL`, `OWNER_NAME`, `OWNER_PASSWORD` | The first owner account, created by `npm run db:seed`. |
| `SMTP_URL`, `MAIL_FROM` | Email for booking alerts and contact-form messages. Without them nothing is emailed. |
| `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_IMPERSONATE_USER` | Optional Google Calendar sync for idea reviews. |
| `SITE_URL` | Public address, used in links inside emails. |

Never commit `.env.local` or share it in a zip: it holds the database password and the session secret.

## More

- [docs/cms.md](docs/cms.md): how the admin works, roles, deploy steps, uploads, messages and the seed.
- `npm run lint` and `npx tsc --noEmit` should both pass before you deploy.
