# Quick Start

This guide starts the complete local development environment for Dev Interview Notes.

## Prerequisites

- Docker Engine 24+ with Docker Compose
- Git

## Start with Docker Compose

```bash
git clone <your-repository-url>
cd dev_interview_notes
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up --build db migrations api frontend
```

Open the application at <http://localhost:5173>.

The API is available at <http://localhost:8888>. Interactive documentation is available at <http://localhost:8888/docs>, and the health endpoint is <http://localhost:8888/health>.

The database is exposed to the host on port `5454`. Inside Docker Compose, the API and migrations service connect to PostgreSQL through `db:5432`.

## Common commands

```bash
# Run in the background
docker compose up -d db migrations api frontend

# Follow application logs
docker compose logs -f api

# Stop services
docker compose down

# Stop services and delete database data
docker compose down -v
```

The optional `nginx` service requires reverse-proxy configuration and SSL files under `nginx/`. Those files are not included in the current development setup.

## Local backend run

```bash
poetry install
cp .env.example .env
poetry run alembic upgrade head
poetry run uvicorn app.core.main:app --reload --host 0.0.0.0 --port 8888
```

For a local PostgreSQL instance, update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`.

## Local frontend run

```bash
cd frontend
cp .env.example .env
yarn install
yarn dev
```

Set `VITE_API_URL=http://localhost:8888/api/v1` in `frontend/.env` when the API runs locally.

## First checks

```bash
curl http://localhost:8888/
curl http://localhost:8888/health
```

For configuration, architecture, API routes, and contribution workflow, see the [main README](README.md) and the [docs](docs/).
