# Podcast — Restaurant SaaS

A restaurant management platform: table/QR ordering, reservations, menu management,
payments, and staff/customer accounts.

- **Backend:** Django + Django REST Framework + Channels (ASGI, via Daphne), managed with [uv](https://docs.astral.sh/uv/)
- **Frontend:** React + TypeScript + Vite
- **Database:** PostgreSQL (SQLite fallback for zero-setup local dev)
- **Admin:** Django admin themed with [django-unfold](https://github.com/unfoldadmin/django-unfold)

## Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/) (manages the backend's Python version and virtualenv automatically)
- Node.js 20+ and npm
- PostgreSQL (optional for local dev — omit `DATABASE_URL` to use SQLite instead)

`make` is used on macOS/Linux; on Windows use `build.ps1` (same targets, e.g. `.\build.ps1 install` instead of `make install`).

## Setup

1. **Backend env file**

   ```sh
   cp backend/.env.example backend/.env
   ```

   By default this uses SQLite with zero extra setup. To use PostgreSQL instead, add to `backend/.env`:

   ```
   DATABASE_URL=postgres://<user>:<password>@localhost:5432/<database>
   ```

2. **Frontend env file**

   `frontend/.env` already points at `http://127.0.0.1:8000` for the API/WebSocket base URLs — adjust if your backend runs elsewhere.

3. **Install dependencies**

   ```sh
   make install
   ```

   This runs `uv sync` for the backend (creates `backend/.venv` and installs pinned dependencies from `backend/uv.lock`) and `npm install` for the frontend.

4. **Run migrations**

   ```sh
   uv run --directory backend manage.py migrate
   ```

5. **Create a superuser** (for the Django admin)

   ```sh
   uv run --directory backend manage.py createsuperuser
   ```

   Alternatively, `uv run --directory backend manage.py seed_demo` seeds a demo restaurant with sample staff logins (see command output for credentials).

## Running

```sh
make run
```

Starts both dev servers:

- Backend (Django, ASGI via Daphne dev server): `http://127.0.0.1:8000`
  - Admin: `http://127.0.0.1:8000/admin/`
- Frontend (Vite): `http://localhost:5173`

Run them individually with `make run-backend` / `make run-frontend`.

## Common tasks

| Task | Command |
|---|---|
| Install/refresh dependencies | `make install` |
| Lint (check only) | `make lint` |
| Lint (auto-fix) | `make lint-fix` |
| Type check | `make type-check` |
| Add a backend dependency | `uv add --directory backend <package>` |
| Add a frontend dependency | `npm --prefix frontend install <package>` |

See the `Makefile` (or `build.ps1` on Windows) for the full list of targets.

## Project layout

```
backend/    Django project (apps/, config/, pyproject.toml, uv.lock)
frontend/   React + Vite app (src/)
Makefile    Task runner (macOS/Linux)
build.ps1   Task runner (Windows PowerShell)
```

Backend apps: `accounts` (staff + customer auth), `restaurants`, `tables`, `menu`,
`reservations`, `orders`, `payments`, `realtime` (Channels consumers), `common`.
