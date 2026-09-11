# Ticket System

A full-stack ticket management application built with a Go REST API, React/Vite frontend, JWT authentication, bcrypt password hashing, and SQLite.

## Live Application

- Application: https://ticket-system-jmdy.onrender.com
- Backend: https://ticket-system-backend-fcta.onrender.com
- Health Check: https://ticket-system-backend-fcta.onrender.com/health

## Features

- User registration and login
- JWT Bearer authentication
- Password hashing with bcrypt
- Create tickets
- View authenticated user's tickets
- View a single ticket owned by the authenticated user
- Update ticket status
- Ticket status values:
  - `open`
  - `in_progress`
  - `closed`
- Closed tickets cannot be reopened
- Ownership checks prevent users from accessing or modifying other users' tickets
- SQLite database
- Dockerized backend and frontend
- CORS configured for the local and deployed frontend

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Login and receive JWT |
| POST | `/tickets` | Yes | Create a ticket |
| GET | `/tickets` | Yes | Get the authenticated user's tickets |
| GET | `/tickets/{id}` | Yes | Get one owned ticket |
| PATCH | `/tickets/{id}/status` | Yes | Update the status of an owned ticket |

Authenticated requests use:

```text
Authorization: Bearer <JWT>
```

## Project Structure

```text
ticket_system/
├── data/
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── .env.example
├── .gitignore
├── Dockerfile
├── go.mod
├── go.sum
└── main.go
```

## Local Run

### Backend

From the repository root:

```bash
docker build -t ticket-system .
docker run -p 8080:8080 -e JWT_SECRET="my-local-secret" ticket-system
```

Health check:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status":"ok"}
```

### Frontend

The frontend can be run in development mode with:

```bash
cd Frontend
npm install
npm run dev
```

The frontend uses the `VITE_BACKEND_URL` environment variable.

Example:

```env
VITE_BACKEND_URL=http://localhost:8080
```

## Docker Frontend

Build the frontend image:

```bash
cd Frontend
docker build -t ticket-frontend .
```

Run it:

```bash
docker run --name ticket-frontend-container -p 5173:80 ticket-frontend
```

Open:

```text
http://localhost:5173
```

The frontend Docker image uses a multi-stage build and serves the production Vite build through nginx.

## Environment Variables

### Backend

The backend reads:

```env
JWT_SECRET=
PORT=
```

`PORT` is provided automatically by the deployment platform. Locally, the application falls back to port `8080`.

### Frontend

The frontend reads:

```env
VITE_BACKEND_URL=
```

For local development:

```env
VITE_BACKEND_URL=http://localhost:8080
```

For deployment:

```env
VITE_BACKEND_URL=https://ticket-system-backend-fcta.onrender.com
```

Actual `.env` files containing environment-specific values should not be committed to GitHub. `.env.example` files are included as templates.

## Database

SQLite is used for persistence.

The Docker backend stores the database under:

```text
/app/data/ticket_system.db
```

A Docker volume can be mounted at `/app/data` for local container persistence:

```bash
docker volume create ticket-db
docker run --name ticket-backend-container -p 8080:8080 -v ticket-db:/app/data -e JWT_SECRET="my-local-secret" ticket-system
```

## Deployment

The application is deployed using Render.

### Backend

The Go backend is deployed as a Docker Web Service using the root `Dockerfile`.

Production environment variable:

```text
JWT_SECRET=<strong-secret>
```

The backend exposes:

```text
https://ticket-system-backend-fcta.onrender.com
```

Health check:

```text
https://ticket-system-backend-fcta.onrender.com/health
```

### Frontend

The React/Vite frontend is deployed as a Render Static Site using the `Frontend` directory.

Build command:

```bash
npm ci && npm run build
```

Publish directory:

```text
dist
```

Frontend environment variable:

```text
VITE_BACKEND_URL=https://ticket-system-backend-fcta.onrender.com
```

React Router fallback is configured with an nginx/Render rewrite to `/index.html`.

## Assumptions

- Each user can access only their own tickets.
- Ticket creation automatically starts with status `open`.
- A closed ticket cannot be reopened.
- Status values are restricted to `open`, `in_progress`, and `closed`.
- JWT authentication is required for ticket endpoints.
- SQLite is sufficient for the scope of this assignment.
- Environment-specific secrets are supplied through environment variables rather than committed to the repository.
- The frontend communicates directly with the deployed backend API.

## Submission

- GitHub repository: `https://github.com/Nawlesh034/ticket-system`
- Deployed application: https://ticket-system-jmdy.onrender.com
- Public health check: https://ticket-system-backend-fcta.onrender.com/health
