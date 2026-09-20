# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Backend dependency/environment management via [uv](https://docs.astral.sh/uv/): dependencies and a
  `dev` dependency group now live in `backend/pyproject.toml`, pinned in `backend/uv.lock`.
- PostgreSQL support: `psycopg[binary]` driver added; set `DATABASE_URL` in `backend/.env` to use it
  (falls back to SQLite when unset).
- [django-unfold](https://github.com/unfoldadmin/django-unfold) admin theme.
- Root `README.md` with setup/run instructions and this `CHANGELOG.md`.
- Super-admin user management: `UserAdminViewSet` (`/api/auth/users/`) lists every staff account and
  exposes a `set_password` action so a super admin can reset any user's password. On the frontend, a
  new "Users" tab on the platform admin dashboard links to a per-user detail page
  (`/staff/admin/users/:id`) with a change-password form.

### Changed

- `Makefile` and `build.ps1` backend targets (`run-backend`, `install-backend`, `lint-backend`,
  `type-check-backend`, etc.) now go through `uv run` / `uv sync` instead of a manually-managed
  `venv/` + `pip install -r requirements*.txt`.
- Backend Python version pinned to 3.12 via `backend/.python-version`. Python 3.14 hits a Django
  template `Context` copy incompatibility (`AttributeError: 'super' object has no attribute 'dicts'`)
  that surfaces on any page using `django-unfold`'s template tags.

### Fixed

- Django admin's "change password" link was missing on the `User` change page: `django-unfold`
  replaces the stock read-only-password-hash widget template and only restores the link when the
  `ModelAdmin` uses Unfold's own form classes. `StaffUserAdmin` now sets `form`/`add_form`/
  `change_password_form` to `unfold.forms`' versions so the link shows again for every role.

### Removed

- `backend/requirements.txt` and `backend/requirements-dev.txt`, superseded by
  `backend/pyproject.toml` / `backend/uv.lock`.
- Stale `backend/venv/` (pip-based virtualenv), superseded by `backend/.venv/` (managed by uv).
