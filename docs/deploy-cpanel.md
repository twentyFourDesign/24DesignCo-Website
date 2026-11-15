# Deploy to cPanel (Node.js)

The site is a Node.js app. Your hosting needs **Setup Node.js App** in cPanel, with **Node.js 20.9 or later** (22 is best).

## What's in the zip

You don't run `npm install` or a build on the server. Everything is already in the zip.

| File or folder | What it is |
| --- | --- |
| `server.js` | Starts the site. This is the startup file. |
| `.next/`, `node_modules/`, `public/` | The built site, the code it needs, and its images. |
| `migrate.mjs`, `db/migrations/` | Bring the database up to date. |
| `env-variables.txt` | The list of settings to enter in cPanel. |

Files and folders starting with a dot (such as `.next`) are hidden in File Manager by default. Turn on **Settings › Show Hidden Files** to see them.

## First time

1. **Upload.**
   - In cPanel open **File Manager** and go to your home folder, the one *above* `public_html`. Don't put the site inside `public_html`.
   - Upload `24designco-site.zip`, then right-click it and choose **Extract**. This gives you a `24designco-site` folder.
   - Using FTP? Upload the zip, then extract it in File Manager. Uploading the 2,400+ files one by one over FTP is slow and easy to break.
2. **Create the app.** Go to **Setup Node.js App › Create Application** and set:
   - Node.js version: 22 (or the highest 20.9+ offered)
   - Application mode: Production
   - Application root: `24designco-site`
   - Application URL: `24group.com.ng`
   - Application startup file: `server.js`
3. **Add the settings.** Under **Environment variables**, add each one below and click **Save**.

   | Name | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your Neon connection string. Use the new one after you rotate the password. |
   | `AUTH_SECRET` | A long random string. Use a new one; this signs everyone out once. |
   | `SITE_URL` | `https://24group.com.ng` |
   | `SMTP_URL` | Your email server, e.g. `smtps://info%4024group.com.ng:PASSWORD@mail.24group.com.ng:465` |
   | `MAIL_FROM` | `24 Design Co. <info@24group.com.ng>` |
   | `GOOGLE_SERVICE_ACCOUNT_JSON` | Optional, for Google Calendar sync. |

   In `SMTP_URL`, write the `@` inside the username as `%40`. cPanel's own mail server details are under **Email Accounts › Connect Devices**.
4. **Update the database.**
   - At the top of the app's page, copy the command that starts with `source /home/…/activate`. It enters the app's environment.
   - Open **Terminal** in cPanel, paste that command, then run:
     ```
     node migrate.mjs
     ```
   - It should end with "Database is up to date."
   - Do this before you start the app.
5. **Start.** Click **Restart** on the app's page.
6. **Check.**
   - Open https://24group.com.ng.
   - Sign in at `/admin`.
   - Send yourself a test message from `/contact`.
   - Check that it appears under Admin › Messages and in your email.

## SSL and the domain

- Make sure SSL is on for 24group.com.ng (**SSL/TLS Status › Run AutoSSL**). The admin's sign-in needs HTTPS.
- If the domain currently points to Vercel, the site will only be served from cPanel once the domain's DNS points to this hosting. Your host can confirm the A record.

## Updating the site later

1. Upload and extract the new zip over the `24designco-site` folder. Your settings stay, because they're stored in cPanel, not in the folder.
2. Run `node migrate.mjs` again. It only applies what's new.
3. Click **Restart**.

## How the zip is built

```
npm run build        # needs DATABASE_URL; next.config.ts has output: "standalone"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp -r db/migrations .next/standalone/db/migrations
cp -r node_modules/postgres .next/standalone/node_modules/
cp deploy/migrate.mjs .next/standalone/
```

Build on Linux x64, the same kind of machine as the server, because the image library includes compiled files for that platform.

## If something goes wrong

- **The app won't start or shows a 503.** Open `stderr.log` in the app folder. Check that the Node.js version is 20.9 or later and that every setting above is filled in.
- **"AUTH_SECRET must be set".** Add `AUTH_SECRET`, at least 32 characters, then restart.
- **The site works but emails don't arrive.** Check `SMTP_URL`. Messages are still saved in Admin › Messages either way.
