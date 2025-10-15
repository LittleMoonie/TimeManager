# Company-Scoped RBAC Specification

This document outlines the Role-Based Access Control (RBAC) system for company-scoped operations within the GoGoTime application. All roles and permissions defined herein are evaluated per company/organization (`org_id`), ensuring that users only have access to resources and functionalities relevant to their assigned company.

## 1. Company-Scoped Roles

Roles are attached to a user **per company**, meaning a user can have different roles in different companies.

*   `employee`: Standard user with basic timesheet management capabilities.
*   `manager`: Manages a team, including timesheet approvals and team-level reporting.
*   `hr`: Manages HR-related functions, including timesheet corrections, schedules, and action codes.
*   `payroll`: Manages payroll-related functions, including period locking and data exports.
*   `auditor`: Read-only access for auditing purposes.
*   `company_admin`: Administrator for a specific company, managing RBAC, settings, and menu configuration for that company. **This is not a global super admin.**

## 2. Permission Keys

Permission keys follow the format `resource.action.scope` and are **evaluated per company**.

### Timesheets
*   `timesheet.view.self`: View own timesheets.
*   `timesheet.create.self`: Create own timesheets.
*   `timesheet.update.self`: Update own timesheets.
*   `timesheet.submit.self`: Submit own timesheets.
*   `timesheet.view.team`: View team members' timesheets.
*   `timesheet.approve.team`: Approve team members' timesheets.
*   `timesheet.reject.team`: Reject team members' timesheets.
*   `timesheet.comment.team`: Add comments to team members' timesheets.
*   `timesheet.view.org`: View all timesheets within the organization/company.
*   `timesheet.correct.org`: Correct timesheets within the organization/company.
*   `timesheet.lock.period`: Lock timesheet periods for the organization/company.
*   `timesheet.export.org`: Export timesheet data for the organization/company.

### Codes/Schedules/Policies
*   `actioncode.view`: View action codes.
*   `actioncode.manage`: Manage (create, edit, delete) action codes.
*   `schedule.view`: View schedules.
*   `schedule.manage`: Manage (create, edit, delete) schedules.
*   `policy.view`: View policies.
*   `policy.manage`: Manage (create, edit, delete) policies.

### People & Teams
*   `user.view.team`: View team members' user profiles.
*   `user.view.org`: View all user profiles within the organization/company.
*   `team.manage`: Manage teams (create, edit, delete).
*   `user.manage`: Manage user profiles (create, edit, delete) within the organization/company.

### Reports
*   `report.view.team`: View team-level reports.
*   `report.view.org`: View organization/company-level reports.

### System (Company Admin)
*   `rbac.manage.company`: Manage roles and permissions for the company.
*   `settings.manage.company`: Manage company-specific settings.
*   `menu.manage.company`: Manage the company's navigation menu and hub cards.
*   `audit.view.company`: View audit logs for the company.

## 3. Baseline Role-Permission Mapping (Per Company)

This section defines the default permissions assigned to each company-scoped role.

*   **`employee`**
    *   `timesheet.view.self`
    *   `timesheet.create.self`
    *   `timesheet.update.self`
    *   `timesheet.submit.self`
    *   `actioncode.view`
    *   `schedule.view`
    *   `policy.view`

*   **`manager`** (inherits `employee` permissions plus)
    *   `timesheet.view.team`
    *   `timesheet.approve.team`
    *   `timesheet.reject.team`
    *   `timesheet.comment.team`
    *   `report.view.team`
    *   `user.view.team`

*   **`hr`** (inherits `manager` permissions plus)
    *   `timesheet.view.org`
    *   `timesheet.correct.org`
    *   `timesheet.lock.period`
    *   `actioncode.manage`
    *   `schedule.manage`
    *   `policy.manage`
    *   `report.view.org`

*   **`payroll`**
    *   `timesheet.view.org`
    *   `timesheet.lock.period`
    *   `timesheet.export.org`
    *   `report.view.org`

*   **`auditor`** (read-only)
    *   `timesheet.view.org`
    *   `actioncode.view`
    *   `schedule.view`
    *   `policy.view`
    *   `user.view.org`
    *   `report.view.org`
    *   `audit.view.company`

*   **`company_admin`** (inherits all above permissions plus)
    *   `rbac.manage.company`
    *   `settings.manage.company`
    *   `menu.manage.company`
    *   `audit.view.company`
    *   `user.manage`
    *   `team.manage`

## 4. Seeder Update Plan (Document Only)

To implement these roles and permissions, the existing seeders in `App.API/Seeds` will need to be updated. The plan is as follows:

1.  **Create new seed files** (e.g., `06-seed-company-roles.ts`, `07-seed-company-permissions.ts`, `08-seed-company-role-permissions.ts`) or modify existing ones to handle company-scoped data.
2.  **Ensure `company_id` association:** All seeded roles, permissions, and their linkages must be associated with a specific `company_id`.
3.  **Define default roles and permissions:** The seeders will create the roles and permissions as defined in Section 1 and 2 for a default company (or for each new company created during initial seeding).
4.  **Map roles to permissions:** The seeders will establish the baseline role-permission mappings as defined in Section 3.
5.  **Idempotency:** Seeders must be idempotent, meaning they can be run multiple times without creating duplicate entries or causing errors.
6.  **Migration consideration:** If new tables are required for company-scoped RBAC (e.g., `CompanyRole`, `CompanyPermission`, `CompanyRolePermission`), corresponding migrations will be created prior to seeder updates.

This plan ensures that the RBAC structure is correctly initialized and maintained across different company instances.