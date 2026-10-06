# Rwenanura Parents Primary School — Website & School Portal

Public website and online services for Rwenanura Parents Primary School (RPPS), Nyagatare District, Rwanda.

**For families:** school information in English, Kinyarwanda and French, online admission applications with status tracking, a tuition estimator, news and a newsletter.

**For the school:** a management console for admissions, news, the academic calendar and user accounts.

**For pupils and staff:** a sign-in portal with the school calendar.

**For former pupils:** the OBs & OGs alumni network with a live chat lounge and a member directory.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | Vanilla JavaScript modules, built with [Vite](https://vite.dev) |
| API | Node.js + Express (`server/`) |
| Database | SQLite via better-sqlite3 (one file, no separate database server) |
| Email | Nodemailer over any SMTP provider |
| Tests | Node's built-in test runner (`tests/`), ESLint |

## Quick start (development)

Requirements: **Node.js 22 or newer**.

```bash
npm install
cp .env.example .env
# Generate a session secret and paste it into .env as JWT_SECRET=...
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run dev
```

Open <http://localhost:5173>. `npm run dev` starts the Vite dev server (port 5173), which forwards `/api` requests to the API server (port 5000).

### The first administrator

On first start an admin account is created with the email in `SEED_ADMIN_EMAIL` (default `admin@rwenanura.ac.rw`). How you get its password:

- **If `SEED_ADMIN_PASSWORD` is set,** that is the password.
- **Otherwise,** a random password is generated and saved to `server/data/initial-admin-password.txt`, readable only by the server user. It is never printed to the logs.

Sign in, change the password through **Log In → Forgot password?**, then delete that file.

### Emails during development

With `SMTP_HOST` empty, emails (account confirmation, password reset, application updates) are printed in the server terminal instead of being sent. Open the link from the terminal to continue the flow.

## Configuration (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | **yes** | 32+ random characters used to sign login sessions. The server refuses to start without a strong value. |
| `PORT` | no | API/website port (default `5000`). |
| `NODE_ENV` | no | Set to `production` on the live server: enables secure cookies and HSTS, and stops emails being logged. |
| `APP_URL` | production | Public address of the site, e.g. `https://rwenanuraparents.sch.rw`. Used in email links, the sitemap and sharing previews. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | no | First admin account (see above). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | production | Outgoing email. Port 465 uses TLS; 587 uses STARTTLS. |
| `ADMISSIONS_NOTIFY_EMAIL` | no | Receives an email for every new admission application. |
| `TRUST_PROXY` | behind a proxy | Number of reverse-proxy hops (usually `1` behind nginx) so rate limits see real visitor IPs. Leave empty otherwise. |
| `CORS_ORIGINS` | no | Comma-separated origins allowed to call the API from another domain. |
| `DB_PATH` | no | Database file location (default `server/data/database.sqlite`). |

## Accounts and roles

| Role | How it is created | Can |
|---|---|---|
| Visitor | — | Read the site, apply for admission, track an application, read the alumni lounge |
| Student (pupil) | **Register → Student**, then approved by staff | Everything visitors can, plus view the school calendar |
| Staff | **Register → Staff**, then approved by an admin | Manage admissions and news, edit the calendar, approve pupils, reset pupil passwords |
| Admin | First admin is seeded; others promoted by an admin | Everything, including approving staff and changing roles |
| Alumni | Alumni network → **New Alumni Registration** | Post in the alumni lounge and see members' contact details |

How sign-up works for each kind of account:

- **Email confirmation:** every account registered with an email must confirm it through the emailed link before signing in.
- **Pupils:** sign in with a **username**, and their email is optional (a parent's email is fine). Staff can issue a temporary password from **Management Console → Accounts → Reset Password**.
- **Approvals:** pending accounts appear in **Management Console → Accounts**. Staff see pupils; admins see everyone.

## School content to provide

Some features show a fallback until the school supplies real content:

| What | Where | Until provided |
|---|---|---|
| Photos | Replace files in `public/images/`, keeping the same names (e.g. `hero-1.jpg`, `facility-library.jpg`, `headteacher.jpg`). Landscape JPEGs about 1600px wide for `hero-*`, 800–1200px for the rest. | Stock photos |
| Prospectus | Put the PDF at `public/prospectus.pdf` | The button offers to request it by email |
| Alumni WhatsApp group | Set `links.alumniWhatsApp` in `src/data/schoolData.js` | WhatsApp buttons are hidden |
| Privacy notice and terms | `src/data/policies.js`; have the school review them | Draft text describing what the site collects |
| School details, fees, FAQ | `src/data/schoolData.js`, `src/data/i18n.js` | Current text |

News, the academic calendar and accounts are managed in the website itself (**Management Console**), not in code.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development: Vite + API server with live reload of the frontend |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run server` | Start the API server. It also serves `dist/` when present. |
| `npm test` | API test suite (starts the server on a throwaway database) |
| `npm run lint` | ESLint |

CI (`.github/workflows/ci.yml`) runs lint, tests, the build and `npm audit` on Node 22 and 24 for every push.

## Project structure

```
server/
  index.js          Express app: security headers, CSRF guard, routes, static files
  db.js             SQLite schema, migrations and first-run seed data
  mailer.js         Outgoing email
  calendarData.js   Initial academic calendar (copied into the database once)
  routes/           auth, admissions, alumni, calendar, news, newsletter, seo
src/
  main.js           Builds the page; rebuilt when the language changes
  components/       One module per page section / modal (alumni/ = alumni modal tabs)
  data/             API client, translations, school content, roles
  utils/            HTML escaping, modal accessibility, lifecycle scope
  styles/           Stylesheets (alumni/ = alumni modal and homepage section)
public/             Static files copied as-is: images, fonts, prospectus
tests/              API tests
```

## Security overview

**Sign-in and sessions:**

- Sessions use an `httpOnly`, `SameSite=Strict` cookie, which page scripts cannot read.
- State-changing requests must carry an `X-Requested-With` header (CSRF protection).
- Every request re-checks the account's current role. Removing an account or resetting its password ends its sessions immediately.
- Passwords are hashed with bcrypt. Email links are single-use, expire, and are stored only as hashes.
- Rate limits apply to logins (failed attempts only), registrations, email actions and public forms.

**Pages and data:**

- A Content Security Policy blocks third-party scripts, and the site loads nothing from other domains.
- User content is HTML-escaped everywhere.
- Server logs contain account IDs, never passwords, emails or message text.

To report a security problem, contact the school office at info@rwenanuraparents.sch.rw.
