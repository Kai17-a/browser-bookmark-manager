# Bookmark Manager Monorepo

This repository is organized as a monorepo.

## Layout

- `api/` - FastAPI backend source and tests
- `frontend/` - single-page HTML/CSS/JS client
- `specs/` - implementation notes and task tracking

## API

The backend lives under `api/`.

The frontend lives under `frontend/` as a single `index.html` file and uses Tailwind via CDN.

Run the API from the repository root with:

```bash
api-dev
```

Run the API tests with:

```bash
python -m pytest -q
```

Pytest is configured to collect tests from `api/tests`.

## Docker

Run both services with:

```bash
docker compose up --build
```

- Frontend: `http://127.0.0.1:8080`
- API: `http://127.0.0.1:8000`
