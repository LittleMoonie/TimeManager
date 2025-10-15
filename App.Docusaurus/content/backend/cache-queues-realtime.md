# 🚀 Caching, Queues & Real-time Features

## 📋 Overview

The current GoGoTime backend focuses on delivering core REST endpoints backed by PostgreSQL. We do not yet ship distributed caching, background workers, or WebSocket infrastructure. This page documents the present state and the guardrails to follow if you introduce these capabilities.

## ⚡ Current Behaviour

- **Caching**: All reads go directly through TypeORM and PostgreSQL. There is no Redis instance in `App.Infra/docker-compose.yml`, and no caching middleware in `App.API`.
- **Async Workloads**: The API processes requests synchronously; BullMQ or other queue libraries are not part of the dependency tree. Long-running tasks should currently be handled synchronously or postponed until a queue is introduced.
- **Real-time Updates**: Socket.IO and WebSocket adapters are not implemented. Clients poll HTTP endpoints for fresh data.

## 🛠️ Adding Caching or Queues

If a feature requires caching or background processing:

1. **Propose the architecture** in a design doc or pull request description.
2. **Add infrastructure** to `App.Infra/docker-compose.yml` (e.g., Redis) and supply local environment variables via `.env.example`.
3. **Introduce dependencies** in `App.API/package.json` (such as `ioredis`, `bullmq`, or `socket.io`) and document new services in `App.Docs`.
4. **Keep fallbacks** for developers who do not have the new service running—wrap integrations behind feature flags or environment checks.

## 📈 Monitoring When Introduced

When caching or queueing arrives, ensure metrics and logs flow into the existing Prometheus/Grafana stack shipped in the Compose file. Add dashboard links and troubleshooting steps to this page so operators can validate behaviour quickly.

## 📍 Roadmap Ideas

- Redis-backed cache for expensive company-wide reports.
- BullMQ workers for email notifications and nightly exports.
- Socket.IO gateway for manager dashboards that need live updates.

These items remain aspirational until the underlying code and infrastructure land in the repository.

---

**SUMMARY**: Caching, background jobs, and realtime messaging are not implemented today. Use this guide when planning those features—add the necessary infrastructure, document new dependencies, and instrument them so the operations team can monitor their health.
