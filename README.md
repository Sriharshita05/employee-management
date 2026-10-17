# Employee Management System

Full-stack HR application: **React (Vite)** frontend, **Laravel 12** REST API, **MySQL**, token auth with **Laravel Sanctum**.

## Features

- Employee, department and attendance management with search, sorting, pagination and XLSX/PDF/CSV export
- Role-based access control (admin, HR, manager) enforced by API middleware and mirrored in the UI
- **Leave management**: HR/admin file requests, admin/manager approve or reject
  - Yearly allowance per leave type (`backend/config/leave.php`), weekends excluded from day counts
  - Overlap and balance checks run inside a transaction with a row lock, so simultaneous requests cannot both pass
  - Approval marks the employee "on leave" in attendance; a request can only be decided once (409 otherwise)
- **Queued email notifications**: approvers are told about new requests, the employee about decisions
- **Audit log** (admin only): who created, changed or deleted what, with old and new values; passwords and tokens are never recorded
- Login rate limiting (10 attempts per minute per IP)

## Permission matrix

| Action                    | Admin | HR  | Manager |
|---------------------------|:-----:|:---:|:-------:|
| View employees / attendance / leave | yes | yes | yes |
| Create / edit employees   | yes   | yes | no      |
| Delete employees          | yes   | no  | no      |
| Manage departments        | yes   | no  | no      |
| File / cancel leave       | yes   | yes | no      |
| Approve / reject leave    | yes   | no  | yes     |
| Reports, audit log, users | yes   | no  | no      |

## Run with Docker

```bash
cp .env.docker.example .env      # set APP_KEY (command is in the file)
docker compose up --build
docker compose exec app php artisan db:seed --force   # optional demo data
```

React app on http://localhost:5173, API on http://localhost:8000/api. A separate `worker` container processes the email queue. Mail is written to the log by default; set `MAIL_*` for a real SMTP server.

## Run locally

```bash
# API
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work        # in another terminal, for emails

# Frontend
cd frontend
npm install
npm run dev
```

## Tests and CI

```bash
cd backend && php artisan test     # PHPUnit, in-memory SQLite
cd frontend && npm run lint && npm run build
```

GitHub Actions (`.github/workflows/ci.yml`) runs both on every push to `main` and every pull request.
