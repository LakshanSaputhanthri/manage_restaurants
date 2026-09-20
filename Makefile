UV := uv --directory backend
NPM := npm --prefix frontend

.PHONY: run run-backend run-frontend \
	lint lint-backend lint-frontend \
	lint-fix lint-fix-backend lint-fix-frontend \
	type-check type-check-backend type-check-frontend \
	type-fix type-fix-backend type-fix-frontend \
	install install-backend install-frontend

## Run both dev servers (backend on :8000, frontend on :5173)
run:
	$(MAKE) -j2 run-backend run-frontend

run-backend:
	$(UV) run manage.py runserver

run-frontend:
	$(NPM) run dev

## Install/refresh dependencies
install: install-backend install-frontend

install-backend:
	$(UV) sync

install-frontend:
	$(NPM) install

## Lint check (no changes written)
lint: lint-backend lint-frontend

lint-backend:
	$(UV) run ruff check .

lint-frontend:
	$(NPM) run lint

## Lint fix (auto-fixable issues only)
lint-fix: lint-fix-backend lint-fix-frontend

lint-fix-backend:
	$(UV) run ruff check --fix .

lint-fix-frontend:
	$(NPM) run lint:fix

## Type check (no changes written)
type-check: type-check-backend type-check-frontend

type-check-backend:
	$(UV) run mypy .

type-check-frontend:
	$(NPM) run type-check

## Type "fix": there is no safe auto-fixer for type errors, so this
## runs ruff's type-related autofixes (e.g. unused imports, isort) plus
## eslint --fix, then re-runs the checks so remaining errors are still visible.
type-fix: type-fix-backend type-fix-frontend

type-fix-backend: lint-fix-backend
	$(UV) run mypy .

type-fix-frontend: lint-fix-frontend
	$(NPM) run type-check
