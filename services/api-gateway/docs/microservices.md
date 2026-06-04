# Microservice Architecture

## Runtime

The backend is organized as independent services at the project root:

| Service | Port | Responsibility | Database |
| --- | ---: | --- | --- |
| API Gateway | 4008 | Routes `/api/*` requests and serves Swagger | None |
| Auth Service | 4011 | Users, JWT, RBAC, profile, password reset | `tzw_auth_service` |
| Extinguisher Service | 4012 | Inventory CRUD and inventory report data | `tzw_extinguisher_service` |
| Inspection Service | 4013 | Inspection scheduling, completion, maintenance logs | `tzw_inspection_service` |
| Report Service | 4014 | Aggregates internal service APIs and stores report snapshots | `tzw_reporting_service` |
| Notification Service | 4015 | Email/SMTP delivery and notification history | `tzw_notification_service` |

## Folder Shape

Each service follows the independent structure requested for the coursework:

```text
services/<service-name>/
  dist/
  migrations/
  src/
  Dockerfile
  package.json
  tsconfig.json
```

Common helper code is copied into each service so a service can build and run from its own folder.

## Authentication Rule

Public registration always creates a `User` role. Admin and Inspector accounts are created through the protected Auth Service user-management endpoint:

```text
POST /api/users
```

The seeded Admin credential is:

```text
admin@tzw.local / password123
```

## Data Ownership

Databases are separated by service. Cross-service relationships are not enforced with foreign keys. For example, the inspection service stores `extinguisher_id`, `serial_number`, and `location` snapshots after reading extinguisher details from the extinguisher service.

Reporting does not query other service databases directly. It calls internal endpoints:

- `extinguisher-service/internal/reports/inventory-summary`
- `extinguisher-service/internal/reports/inventory-rows`
- `inspection-service/internal/reports/inspection-summary`
- `inspection-service/internal/reports/recent-maintenance`
- `inspection-service/internal/reports/maintenance-rows`

## Gateway Routes

The gateway forwards:

```text
/api/auth          -> auth-service
/api/users         -> auth-service
/api/extinguishers -> extinguisher-service
/api/inspections   -> inspection-service
/api/maintenance   -> inspection-service
/api/reports       -> report-service
/api/notifications -> notification-service
```

## Docker

`docker-compose.yml` runs the full stack. Each service uses its own Dockerfile and build context.

```bash
docker compose up --build
```
