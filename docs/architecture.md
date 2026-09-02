# Architecture

## System overview

Dev Interview Notes is split into a browser client, a REST API, and a PostgreSQL database.

```text
React/Vite browser client
          |
          | JSON over HTTP; cookies included
          v
FastAPI application
          |
          | SQLAlchemy 2 async sessions
          v
PostgreSQL
```

Docker Compose runs the database, migration job, API, and frontend as separate services connected to a private bridge network. The API and migration job use the internal database address `db:5432`; the host-facing database port is `5454`.

## Backend layers

### Routers

Files under `app/routers/` define HTTP paths, status codes, dependencies, response models, and access checks. Routers should stay thin and delegate business operations to services.

### Services

Files under `app/services/` coordinate use cases such as authentication, question management, favorites, progress tracking, companies, roadmaps, and email delivery. Services are the preferred place for validation that involves more than one repository or entity.

### Repositories

Files under `app/repositories/` encapsulate SQLAlchemy queries and persistence operations. This keeps database access separate from HTTP concerns and makes service logic easier to reason about.

### Schemas

Files under `app/schemas/` contain Pydantic models for request validation, filtering, pagination, and API responses. The API uses UUID identifiers and structured JSON content for questions.

### Models and database

SQLAlchemy models live under `app/db/models/`. The async engine and request-scoped session dependency are defined in `app/db/database.py`. The session commits successful requests and rolls back failed requests.

## Main domain entities

| Entity | Responsibility |
| --- | --- |
| User | Account identity, role, active state, login protection, and profile data |
| Category | Groups questions by subject or technology |
| Question | Main study unit with structured content, difficulty, publication state, and optional company/user links |
| Answer | Explanation associated with a question |
| Company | Company profile and company-specific question collection |
| Roadmap | Profession-oriented study plan composed of ordered roadmap items |
| QuestionFavorite | User-to-question saved-item relationship |
| QuestionCompletion | User-to-question progress relationship |
| Feedback | User feedback delivered through the email service |

## Request lifecycle

1. The frontend sends a request to the `/api/v1` API prefix.
2. CORS middleware validates the browser origin and cookie middleware extracts authentication data.
3. FastAPI dependencies resolve the database session and, for protected routes, the current active user.
4. `check_permission` enforces role-based access requirements.
5. The router delegates to a service.
6. The service calls one or more repositories.
7. The session dependency commits the transaction on success or rolls it back on error.
8. Pydantic response models serialize the result into JSON.

## Authentication and authorization

Authentication uses two JWTs:

- An access token for short-lived API access.
- A refresh token for issuing a new access token.

Both are stored as HTTP-only cookies. Cookies use `secure=True` in production and `SameSite=Lax` in the current implementation.

The authorization layer supports the `user` and `admin` roles. Admin access bypasses resource-level permission checks, while regular users receive read access to learning content and can manage their own study state.

## Migrations

Alembic owns schema evolution. The application does not create tables automatically in the lifespan handler. A fresh environment must run:

```bash
poetry run alembic upgrade head
```

The Compose migration service waits for PostgreSQL and applies the same command before the stack is used.

## Operational considerations

- Use environment-provided secrets; the defaults in the settings classes are for development only.
- Restrict `CORS_ORIGINS` to trusted frontend origins in production.
- Set `DEBUG=False` outside local development.
- Run the API behind HTTPS so production cookies are marked secure.
- Configure a real SMTP provider before enabling password recovery or email-based feedback delivery.
- Add health monitoring around `/health` and PostgreSQL connectivity.
