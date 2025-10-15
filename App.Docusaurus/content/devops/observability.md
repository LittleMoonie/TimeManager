# 📊 Observability & Monitoring

## 📋 Overview

GoGoTime ships with a pragmatic observability stack aimed at local visibility rather than a full production telemetry pipeline. This document describes what is enabled out of the box, how we capture logs, and the tasks still open for future contributors.

## 🏗️ Current Stack

- **Metrics & Dashboards**: The Docker Compose file (`App.Infra/docker-compose.yml`) starts Prometheus, node-exporter, cAdvisor, and Grafana. Prometheus scrapes the container metrics exposed by these exporters; Grafana can visualise container CPU, memory, and basic host statistics using prebuilt dashboards.  
- **Logging**: The API uses Winston (`App.API/Utils/Logger.ts`) to write JSON-formatted logs to stdout/stderr. Docker captures these logs, and developers can inspect them with `docker compose logs api`. There is no centralized log store such as Loki yet.  
- **Tracing**: No distributed tracing is configured. Requests are inspected through logs and database audits.  
- **Alerting**: Alertmanager is not part of the Compose stack; teams handle alerts manually by monitoring Grafana dashboards or container logs.

## 📈 Instrumentation Guidelines

### API

1. Use the shared Winston logger for request tracing and error details. Include `companyId`, `userId`, and route context where helpful.  
2. When adding new endpoints, ensure the `/api/system/health` route remains fast and dependency aware—Compose uses it as the API healthcheck.  
3. If you introduce Prometheus metrics, register them in a dedicated service and expose a `/metrics` endpoint behind authentication or network whitelisting.

### Frontend

The Vite client does not push analytics. When instrumenting UI events, coordinate with backend owners to avoid leaking credentials or PII.

## 🔎 Using the Local Stack

1. Start services with `cd App.Infra && docker compose up --build --watch`.  
2. Access Grafana at `http://localhost:3001` (defaults: `admin` / `admin`).  
3. Explore the built-in dashboards for container resource usage.  
4. Tail API logs via `docker compose logs -f api` or through your IDE console.

## 🛣️ Roadmap

The following improvements are encouraged but not yet implemented:

- Centralise logs by adding Loki + Promtail and wiring Winston to emit structured metadata.  
- Expose application-level Prometheus metrics (request durations, DB pool usage).  
- Add Jaeger/OpenTelemetry tracing once background jobs or complex workflows arrive.  
- Configure Alertmanager rules for API outage, high error rate, and database connection exhaustion.

Until these components exist in the repository, treat the observability stack as local-only tooling and communicate production monitoring expectations with your operations team.

---

**SUMMARY**: Prometheus, Grafana, and cAdvisor run via Docker Compose for local visibility, while the API logs through Winston. There is no log aggregation, tracing, or automated alerting yet—those remain on the roadmap for future enhancements.
