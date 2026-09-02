# Frontend Documentation

The frontend is a responsive React application for browsing interview questions, following learning roadmaps, practicing company-specific interview sets, and managing personal study progress.

## Stack

- React 19 and TypeScript
- Vite for development and production builds
- Material UI and Emotion for the component system and theming
- React Router for client-side routing
- TanStack Query and Axios-based service modules for API communication
- React Hook Form and Zod for form state and validation
- React Syntax Highlighter for code content

## Setup

```bash
cd frontend
cp .env.example .env
yarn install
yarn dev
```

The development server runs at <http://localhost:5173>.

The API URL is configured with `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:8888/api/v1
```

The API client sends requests with credentials enabled because authentication is implemented with HTTP-only cookies.

## Available scripts

```bash
yarn dev       # Start Vite with hot module replacement
yarn build     # Type-check and create a production build
yarn lint      # Run ESLint
yarn preview   # Preview the production build locally
```

The project also contains `package-lock.json` and `yarn.lock`; use one package manager consistently for a given checkout. The Dockerfile uses Yarn.

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and product overview |
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/forgot-password` | Public | Request password recovery |
| `/questions` | Authenticated | Browse and filter the question library |
| `/questions/:questionId` | Authenticated | Read a question, answers, and study actions |
| `/companies` | Authenticated | Browse company interview sets |
| `/companies/:companyId/questions` | Authenticated | Review questions for a company |
| `/companies/:companyId/interview/:questionIndex` | Authenticated | Practice interview mode |
| `/roadmap` | Authenticated | Browse profession learning roadmaps |
| `/favorites` | Authenticated | Review saved questions |
| `/profile` | Authenticated | Manage the current profile |
| `/admin` | Admin | Manage users and learning content |

Unknown routes redirect to `/`.

## Frontend structure

```text
src/
├── components/       # Shared UI, navigation, content rendering, and admin components
├── context/          # Authentication and theme providers
├── pages/            # Route-level screens
├── services/         # API clients grouped by resource
├── types/            # Shared TypeScript types
├── utils/             # UI and formatting helpers
├── App.tsx
├── AppContent.tsx    # Router and route protection
└── main.tsx
```

## Authentication flow

1. The user registers or signs in through `authService`.
2. The API sets access and refresh JWT cookies with the HTTP-only flag.
3. `AuthContext` loads the current user and exposes authentication state to the UI.
4. `ProtectedRoute` guards authenticated and admin-only routes.
5. The Axios client attempts `/auth/refresh` when an access token expires.

## Content rendering

Question content is stored as structured blocks. The renderer supports headings, paragraphs, code, info/warning blocks, images, and syntax highlighting. This keeps content editable in the admin panel while allowing the reader UI to present a consistent design.

## Troubleshooting

### The frontend cannot reach the API

- Confirm that the backend is running at `http://localhost:8888`.
- Check `VITE_API_URL` in `frontend/.env`.
- Confirm that the backend `CORS_ORIGINS` includes `http://localhost:5173`.
- Check the browser network tab and API logs.

### The user appears logged out

- Confirm that the browser accepts cookies for the API host.
- Do not switch between `localhost` and `127.0.0.1` during one session.
- Check that the API response includes the authentication cookies.
- Use the logout action and sign in again after changing the API URL.
