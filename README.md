# ELEVATE-SDE-Task-4 · CredVault

CredVault is a full-stack certificate issuing and verification platform. Citizens can submit certificate requests, track their applications, and verify issued certificates. Admins can sign in, review applications, approve or reject requests, and revoke certificates.

## Technology

- Frontend: React, React Router, Lucide React
- Backend: Node.js 20+, Express
- Database: SQLite (`better-sqlite3`)
- Citizen and admin authentication: bcrypt password hashes and role-scoped JWT bearer tokens

## Run locally

Create `Backend\.env` from the example and set a private admin password and a random JWT secret of at least 32 characters:

```powershell
Copy-Item Backend\.env.example Backend\.env
```

In the `Backend` directory, install dependencies and start the API (default port 5000):

```powershell
cd Backend
npm install
npm start
```

In a second terminal at the project root, install frontend dependencies and start React:

```powershell
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The React development server proxies `/api` requests to `http://localhost:5000`. The SQLite database is created at `Backend\data\certificates.sqlite` by default. Change its location with `DATABASE_PATH` in `Backend\.env`.

Citizens create an account from the site before requesting certificates. Admin credentials are initialized from `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `Backend\.env`; no demo accounts or passwords are included.

## API workflows

| Page | API | Result |
| --- | --- | --- |
| Citizen registration | `POST /api/auth/register` | Creates a database account and signs the citizen in |
| Citizen login | `POST /api/auth/login` | Returns a citizen JWT for protected application and history routes |
| Request certificate | `POST /api/applications` | Saves an authenticated citizen's details and returns the database-generated Application ID |
| Track application | `GET /api/applications/track/:applicationId` | Reads the current status and submission date; returns the issued Certificate ID after approval |
| Verify certificate | `GET /api/certificates/verify/:certificateId` | Reads the holder, phone, issue date, and current validity |
| My certificates | `GET /api/citizen/certificates` | Lists only certificates issued from the signed-in citizen's applications |
| Admin login | `POST /api/admin/login` | Returns a JWT stored for the current browser tab |
| Admin applications | `GET /api/admin/applications` | Lists database applications; requires bearer token |
| Approve / reject | `PATCH /api/admin/applications/:applicationId/approve` or `/reject` | Updates application status; approval creates a certificate |
| Admin certificates | `GET /api/admin/certificates` | Lists issued database certificates; requires bearer token |
| Revoke certificate | `PATCH /api/admin/certificates/:certificateId/revoke` | Marks a valid certificate revoked |

Application statuses are `Pending`, `Approved`, and `Rejected`; certificate statuses are `Valid` and `Revoked`. All application and certificate records come from the backend database.

The home page provides the basic services and account entry points. After registering or signing in, the citizen's profile menu shows the initial from their email, navigation, certificate history, and sign-out. Certificate requests and account history require a citizen session; admin routes require a separate admin session.

## Tests and production build

Run the frontend tests and build from the project root:

```powershell
npm test -- --watchAll=false
npm run build
```

Run the backend API tests from `Backend`:

```powershell
npm test
```

## Screenshots

The following captures show the citizen and admin flows against the integrated API:

| Page | Screenshot |
| --- | --- |
| Home | ![CredVault home](screenshots/home.png) |
| Request certificate | ![Certificate request form](screenshots/request-certificate.png) |
| Track application | ![Tracked database application](screenshots/track-application.png) |
| Verify valid certificate | ![Valid certificate verification](screenshots/verify-certificate.png) |
| Verify revoked certificate | ![Revoked certificate verification](screenshots/verify-revoked-certificate.png) |
| Admin login | ![Admin login](screenshots/admin-login.png) |
| Admin applications | ![Database applications and review actions](screenshots/admin-applications.png) |
| Admin certificates | ![Issued certificate registry](screenshots/admin-certificates.png) |
| Admin revocation | ![Revoked certificate registry](screenshots/admin-revoked-certificate.png) |
