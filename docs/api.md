# API Reference

The API prefix defaults to `/api/v1`. FastAPI generates the authoritative OpenAPI schema at `/openapi.json`, with interactive documentation at `/docs` and ReDoc at `/redoc`.

Unless a route is marked public, it requires the authentication cookies issued by the API. Routes marked `Admin` require the `admin` role.

## System

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | API welcome payload and documentation links |
| `GET` | `/health` | Public | Application and database health information |

## Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create a user account |
| `POST` | `/auth/login` | Public | Authenticate and set access/refresh cookies |
| `POST` | `/auth/refresh` | Authenticated by refresh cookie | Issue a new access token |
| `POST` | `/auth/logout` | Authenticated | Clear authentication cookies |
| `GET` | `/auth/me` | Authenticated | Return the current user |
| `PUT` | `/auth/me` | Authenticated | Update the current user's profile |
| `POST` | `/auth/forgot-password` | Public | Start password recovery through email |

## Questions and answers

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/questions/` | Authenticated | List questions with filters, sorting, and pagination |
| `GET` | `/questions/{question_id}` | Authenticated | Get one question with its answers |
| `POST` | `/questions/` | Admin | Create a question |
| `PUT` | `/questions/{question_id}` | Admin | Update a question |
| `DELETE` | `/questions/{question_id}` | Admin | Delete a question |
| `GET` | `/questions/{question_id}/answers/` | Authenticated | List answers for a question |
| `GET` | `/questions/{question_id}/answers/{answer_id}` | Authenticated | Get one answer |
| `POST` | `/questions/{question_id}/answers/` | Admin | Create an answer |
| `PUT` | `/questions/{question_id}/answers/{answer_id}` | Admin | Update an answer |
| `DELETE` | `/questions/{question_id}/answers/{answer_id}` | Admin | Delete an answer |

Question list filters include publication state, difficulty, category, company, completion state, and inactive-category handling. Pagination uses `page_number` and `limit`; the configured maximum limit is 1000.

## Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/questions/categories/` | Authenticated | List categories |
| `GET` | `/questions/categories/{category_id}` | Authenticated | Get one category |
| `POST` | `/questions/categories/` | Admin | Create a category |
| `PUT` | `/questions/categories/{category_id}` | Admin | Update a category |
| `DELETE` | `/questions/categories/{category_id}` | Admin | Delete a category |

## Companies

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/companies/` | Authenticated | List companies with pagination |
| `GET` | `/companies/with-questions` | Authenticated | List companies with question and completion counts |
| `GET` | `/companies/{company_id}` | Authenticated | Get one company |
| `GET` | `/companies/{company_id}/questions` | Authenticated | List questions linked to a company |
| `POST` | `/companies/` | Admin | Create a company |
| `PATCH` | `/companies/{company_id}` | Admin | Update a company |
| `DELETE` | `/companies/{company_id}` | Admin | Delete a company |

## Progress and favorites

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/questions/{question_id}/complete` | Authenticated | Mark a question as completed |
| `DELETE` | `/questions/{question_id}/complete` | Authenticated | Remove completion state |
| `GET` | `/questions/{question_id}/is-completed` | Authenticated | Check completion state |
| `GET` | `/questions/completion/stats` | Authenticated | Get overall completion statistics |
| `GET` | `/questions/completion/stats-by-category` | Authenticated | Get completion statistics by category |
| `POST` | `/questions/{question_id}/favorite` | Authenticated | Add a question to favorites |
| `DELETE` | `/questions/{question_id}/favorite` | Authenticated | Remove a question from favorites |
| `GET` | `/questions/{question_id}/is-favorited` | Authenticated | Check favorite state |
| `GET` | `/questions/favorites/list` | Authenticated | List the current user's favorites |

## Roadmaps

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/roadmaps/` | Public | List active roadmaps |
| `GET` | `/roadmaps/professions` | Public | List available professions |
| `GET` | `/roadmaps/profession/{profession}` | Public | List roadmaps for a profession |
| `GET` | `/roadmaps/{roadmap_slug}` | Public | Get a roadmap by slug |
| `GET` | `/roadmaps/{roadmap_slug}/detail` | Public | Get a roadmap with question details |
| `POST` | `/roadmaps/` | Admin | Create a roadmap |
| `PUT` | `/roadmaps/{roadmap_id}` | Admin | Update a roadmap |
| `DELETE` | `/roadmaps/{roadmap_id}` | Admin | Delete a roadmap |
| `POST` | `/roadmaps/{roadmap_id}/items` | Admin | Add a roadmap item |
| `PUT` | `/roadmaps/items/{item_id}` | Admin | Update a roadmap item |
| `DELETE` | `/roadmaps/items/{item_id}` | Admin | Delete a roadmap item |

## Users and feedback

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/` | Admin | List users |
| `GET` | `/users/{user_id}` | Admin | Get one user |
| `PUT` | `/users/{user_id}` | Admin | Update a user |
| `DELETE` | `/users/{user_id}` | Admin | Delete a user |
| `POST` | `/users/feedback` | Authenticated | Send feedback or a product suggestion |

## Example health response

```json
{
  "status": "healthy",
  "service": "Interview Notes API",
  "version": "0.1.0",
  "environment": "development",
  "dependencies": {
    "database": {
      "status": "healthy",
      "database_version": "15.0"
    }
  }
}
```

The response also includes a timestamp. Database errors change the overall status to `degraded` and include an error description for local diagnostics.
