# Database Layout

Each microservice owns its own PostgreSQL database. Services do not use cross-database foreign keys; when a service needs data from another service, it calls that service through an internal API and stores a small snapshot where needed.

| Service | Database | Migration Folder |
| --- | --- | --- |
| Auth Service | `tzw_auth_service` | `services/auth-service/migrations` |
| Extinguisher Service | `tzw_extinguisher_service` | `services/extinguisher-service/migrations` |
| Inspection Service | `tzw_inspection_service` | `services/inspection-service/migrations` |
| Report Service | `tzw_reporting_service` | `services/report-service/migrations` |
| Notification Service | `tzw_notification_service` | `services/notification-service/migrations` |

The Docker Compose file creates all five databases and each service runs its own migration command on startup.
