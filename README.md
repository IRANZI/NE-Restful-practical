# TZW LTD Fire Extinguisher Management System

This project is now organized like an independent RESTful microservices workspace. The active backend services live in the top-level `services/` folder, and each service has its own `src`, `migrations`, `Dockerfile`, `package.json`, and `tsconfig.json`.

## Project Structure

```text
database/
frontend/
node_modules/
packages/
services/
  api-gateway/
    docs/
    dist/
    src/
    Dockerfile
    package.json
    tsconfig.json
  auth-service/
    dist/
    migrations/
    src/
    Dockerfile
    package.json
    tsconfig.json
  extinguisher-service/
    dist/
    migrations/
    src/
    Dockerfile
    package.json
    tsconfig.json
  inspection-service/
    dist/
    migrations/
    src/
    Dockerfile
    package.json
    tsconfig.json
  notification-service/
    dist/
    migrations/
    src/
    Dockerfile
    package.json
    tsconfig.json
  report-service/
    dist/
    migrations/
    src/
    Dockerfile
    package.json
    tsconfig.json
docker-compose.yml
package.json
README.md
```

The old `backend/` folder is no longer used by Docker or the root workspace. It was left in place only because deleting it was blocked for safety.

## Services

- `api-gateway`: routes all `/api/*` frontend requests and serves Swagger docs
- `auth-service`: registration, login, JWT, profile, password reset, and admin user creation
- `extinguisher-service`: fire extinguisher CRUD and inventory data
- `inspection-service`: inspection scheduling, completion, and maintenance logs
- `notification-service`: SMTP/email logging and notification records
- `report-service`: dashboard summaries and CSV exports

Public registration creates only normal `User` accounts. The seeded Admin account creates Inspector/Admin staff accounts from the protected Users screen.

## Docker Run

Run everything at once:

```bash
docker compose up --build
```

Then open:

```text
Frontend: http://localhost:5174
Gateway:  http://localhost:4008
Swagger:  http://localhost:4008/api-docs
```

Docker starts five PostgreSQL databases, one per service, and runs each service migration automatically.

## Seeded Admin

```text
admin@tzw.local / password123
```

Only the Admin account is seeded. Inspectors and other users are created from the Admin `Users` page.

## Local Development

Install all workspace dependencies:

```bash
npm install
```

Build all services and the frontend:

```bash
npm run build
```

Start everything in development mode:

```bash
npm run dev
```

Run one service independently:

```bash
npm --workspace services/auth-service run dev
npm --workspace services/extinguisher-service run dev
npm --workspace services/inspection-service run dev
npm --workspace services/report-service run dev
npm --workspace services/notification-service run dev
npm --workspace services/api-gateway run dev
```

## Databases

Each service owns its own database:

```text
tzw_auth_service
tzw_extinguisher_service
tzw_inspection_service
tzw_reporting_service
tzw_notification_service
```

See [database/README.md](database/README.md) for database ownership details.
