# 🚀 CI/CD Pipeline & Deployment

## 📋 Overview

Today the GoGoTime platform relies on a lightweight delivery loop. We keep automation focused on documentation previews and expect most validation to happen locally before changes merge. This page explains the current setup and the manual steps teams use to deploy the stack.

## ⚡ Continuous Integration

### GitHub Actions

The repository ships a single workflow, [`docs.yml`](https://github.com/.../blob/main/.github/workflows/docs.yml), which builds the Docusaurus site on pushes to `main` and `develop`. It installs dependencies in `App.Docusaurus/`, runs `yarn build`, and exits. No tests, linting, or artifact publishing run in GitHub Actions yet; contributors must execute `yarn lint`, `yarn typecheck`, and app-specific test commands locally.

### Local Verification

Before opening a pull request:

- Run `cd App.API && yarn test` to execute the Jest test suite (once populated).  
- Run `cd App.Web && yarn test:coverage` for Vitest checks and coverage.  
- Use `yarn typecheck:web`, `yarn typecheck:api`, and `yarn lint` from the repo root to catch typing or ESLint issues.

These commands mirror the guardrails described in `AGENTS.md` and should be attached to PR descriptions until automated.

## 🔧 Jenkins Pipeline

A `Jenkinsfile` is included for on-demand, self-hosted automation. The pipeline:

1. Checks out the repo and prints environment diagnostics.  
2. Installs dependencies for `App.API` and `App.Web` (falling back to `yarn install` if the lockfile is stale).  
3. Attempts to run each package’s `yarn test` command; failures surface in Jenkins but do not block the job if the tests are simply absent.  
4. Builds Docker images using `App.Infra/docker-compose.yml` as a smoke test.

The Jenkins pipeline currently stops after build validation—no deploy stage or registry push is defined. Teams that need full automation can extend this file with publishing and environment promotion steps.

## 🐳 Containerisation & Deployment

### Local and Staging Environments

Developers start the full stack with:

```bash
cd App.Infra
docker compose up --build --watch
```

This brings up PostgreSQL, Adminer, the API, the web client, Prometheus/Grafana, Jenkins, and a docs preview. Hot reload is enabled for API, web, and docs containers via the Compose `develop.watch` configuration.

### Manual Promotion

Production deployments are manual today. Typical steps:

1. Tag a release in Git.  
2. Build images locally or through Jenkins (`docker compose build api web`).  
3. Push images to your target registry (custom scripts needed).  
4. Provision infrastructure (VM or container host) and run the same Compose file with environment-specific overrides.  
5. Run database migrations using `cd App.API && yarn migrate:up`.

No Terraform, Kubernetes, or blue/green rollouts are maintained in-repo; teams adopting those patterns must create new automation alongside infrastructure code.

## 📋 Roadmap

The following improvements are intentionally left for future work:

- Add PR validation workflows (linting, tests, type checks) in GitHub Actions.  
- Publish Docker images from Jenkins or Actions.  
- Introduce automated staging/production deploy jobs and secrets management.  
- Capture deployment artefacts (Swagger docs, seed data snapshots) as pipeline outputs.

---

**SUMMARY**: CI currently consists of a docs-only GitHub Actions workflow plus an optional Jenkins job that installs dependencies, runs tests when present, and builds Docker images. Deployments are manual through Docker Compose; teams can layer on registries, staging, or cloud orchestration as needed.
