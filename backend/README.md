# PHP Backend API

## Setup

1. Create MySQL database and import `../database/schema.sql`.
2. Configure env variables in your hosting panel or `.htaccess`/server config:
   - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`
   - `JWT_SECRET`, `JWT_ISSUER`, `JWT_TTL_SECONDS`
3. Deploy `backend` folder to your PHP host. The API endpoints are in `backend/api/...`.

## Endpoints

- POST `api/auth/register.php` { name, email, phone, password }
- POST `api/auth/login.php` { identifier, password }
- GET `api/auth/me.php` (Bearer token)
- PUT `api/auth/profile_update.php` (Bearer token) { name?, email?, phone? }
- POST `api/transactions/send.php` (Bearer token) { recipient, amount }
- GET `api/transactions/history.php` (Bearer token)

Admin (Bearer token must belong to admin):
- GET `api/admin/list_users.php`
- POST `api/admin/create_user.php`
- PUT `api/admin/update_user.php`
- PATCH `api/admin/toggle_freeze.php`
## Local Development (Windows + XAMPP)
1. Start Apache and MySQL in XAMPP.
2. Ensure DB `cashapp_clone` exists and import `database/schema.sql`.
3. Start backend (PowerShell):
   - Set env (optional; defaults are fine on XAMPP): `APP_ENV=development`, `DB_HOST=127.0.0.1`, `DB_NAME=cashapp_clone`, `DB_USER=root`, `DB_PASS=""`, `JWT_SECRET=devsecret`
   - Run: `C:\xampp\php\php.exe -S 127.0.0.1:8000 -t C:\xampp\htdocs\project\cashapp-php-V2\backend`
4. Health check: http://127.0.0.1:8000/api/health.php should return status ok.
5. Frontend:
   - In `frontend/.env.local`: `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api`
   - `cd frontend && npm ci && npm run dev` → open http://localhost:3000
6. Register, then login. If you want to test frozen behavior: set `is_frozen=1` for your user in MySQL.

## Local Development (Linux + Docker for MySQL)
- Run MySQL with password and import schema, then start the PHP built-in server (`php -S 127.0.0.1:8000 -t backend`), set `NEXT_PUBLIC_API_BASE` for the frontend, then `npm run dev`. See repository notes for exact commands.

## Shared Hosting Deployment
- Backend (PHP):
  - Upload `backend/` to your hosting (e.g., `public_html/backend`). Keep `.htaccess`.
  - Set environment variables in your hosting control panel or adjust `api/helpers/config.php` defaults.
  - Create DB and import `database/schema.sql`.
  - Test: `https://your-domain.com/backend/api/health.php`
- Frontend:
  - Easiest: deploy to Vercel. Set `NEXT_PUBLIC_API_BASE=https://your-domain.com/backend/api`.
  - Alternatively (static hosting): if all pages are client-rendered, run `npm run build` and then `next export` to `out/` (if supported). Upload `out/` to your static hosting and point your domain there. Ensure `NEXT_PUBLIC_API_BASE` points to your backend URL.

## check backend/helpers/config.php
## .env.local
## check frontend/src/lib/api.ts
   - edit the first line