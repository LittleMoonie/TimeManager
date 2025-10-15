# 🎨 Frontend Architecture

## 📋 Overview

The GoGoTime web client lives in `App.Web/` and is built with React 19, TypeScript, Vite, and Material UI. The project targets authenticated internal users first, so we prioritise developer ergonomics, type safety, and a pragmatic layout system over heavy abstractions.

## 🚀 Technology Stack

- **React 19 + TypeScript 5.9** for a typed component model.  
- **Vite 7** for local dev and builds.  
- **Material UI v7** for design system primitives.  
- **TanStack Query** for server state, plus the generated OpenAPI client in `src/lib/api`.  
- **React Router v6** to protect routes and orchestrate layouts.

## 📁 Directory Layout

The `src/` tree is intentionally lightweight:

- `components/` – shared UI pieces (`ui/` for primitives such as `LoadingSpinner`, `layout/` for shell exports, and feature widgets like `timesheet/`).  
- `layout/` – top-level layout plumbing (`Shell`, `Navigation`, `AppBar`).  
- `pages/` – route-level views (e.g., `authentication/login`, `manager/ManagerDashboard`).  
- `hooks/` – custom hooks, including `useAuth` which wraps the authentication API.  
- `lib/` – generated API client (`lib/api`) and helper modules.  
- `theme/` + `themes.ts` – Material UI theme configuration.  
- `routes/AppRoutes.tsx` – central router that handles auth gating and role checks.

We do not currently use a formal `features/` structure or state containers such as Zustand—keep new files consistent with the directories above unless there is a clear benefit to reorganising.

## 🔐 Routing & Guards

`AppRoutes.tsx` defines:

- **ProtectedRoute** – blocks unauthenticated users and shows a spinner while `useAuth` resolves.  
- **RoleProtectedRoute** – enforces role-specific pages (for example, the manager dashboard).  
- Nested routes under `/app` rendered inside `AppLayout` (`Shell`).

When adding routes, wire them into `AppRoutes.tsx` and ensure they render within the existing layout unless deliberately public.

## 🔌 API Integration

`AuthenticationService` and other generated clients (from `App.API/swagger.json`) live in `src/lib/api`. `useAuth` uses TanStack Query to fetch the current user via `AuthenticationService.getCurrentUser`. After modifying backend contracts, regenerate the client with:

```bash
cd App.API && yarn api:generate
cd ../App.Web && yarn api:client
```

## 🎨 Styling & UX

- Material UI theme tokens are defined in `themes.ts`.  
- Component-specific styles rely on the theme—prefer `sx` props or styled components from MUI.  
- Keep global assets in `src/assets/`.

## 🧪 Testing

Vitest is configured but the project currently only includes a Playwright smoke test (`e2e/login.spec.ts`). When you add new components or flows, co-locate Vitest specs next to the implementation (`*.test.tsx`) and expand the Playwright suite for end-to-end coverage.

## ✅ Good Practices

- Prefer named exports and follow the two-space, single-quote lint rules enforced by ESLint.  
- Derive server state through TanStack Query; use local `useState` for purely client-side UI concerns.  
- Keep route guards declarative—avoid referencing auth state directly inside page components.  
- Document new patterns in this file and `AGENTS.md` to keep onboarding accurate.

## 🛣️ Future Work

- Introduce feature-based folders once the timesheet and reporting domains expand.  
- Evaluate Zustand or Redux Toolkit if client-side state becomes more complex than TanStack Query + local state.  
- Add Storybook (or Ladle) for component documentation and visual regression testing.  
- Expand accessibility audits and automated checks (axe, Playwright accessibility assertions).

---

**SUMMARY**: The frontend uses React, TypeScript, Material UI, and TanStack Query atop Vite. Code is organised by component responsibility rather than feature slices, routing lives in `AppRoutes.tsx`, and the generated OpenAPI client plus React Query handle API interactions. Update this page whenever the structure or tooling shifts.
