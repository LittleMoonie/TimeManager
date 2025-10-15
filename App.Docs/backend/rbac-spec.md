# RBAC Specification: Company-Scoped Timesheet Hub

This document outlines the Role-Based Access Control (RBAC) specification for the company-scoped Timesheet Hub. All roles and permissions are evaluated strictly within the context of a specific company/organization (`org_id`). There are no global or tenant-wide super-admin roles or cross-company views.

## 1. Company-Scoped Roles

Roles are attached to a user *per company* and define a set of permissions applicable only within that company.

-   `employee`: Standard user, primarily manages their own timesheets.
-   `manager`: Manages a team's timesheets and related activities.
-   `hr`: Manages HR-related timesheet operations across the organization.
-   `payroll`: Focuses on payroll-specific timesheet tasks, including exports and period locking.
-   `auditor`: Read-only access for auditing purposes within the company.
-   `company_admin`: Full administrative control over company-specific settings, RBAC, and menu management (not a global super admin).

## 2. Permission Keys

Permission keys follow the format `resource.action.scope` and are evaluated *per company*. The `scope` can be `self`, `team`, or `org` (company-wide).

### Timesheets
-   `timesheet.view.self`: View own timesheets.
-   `timesheet.create.self`: Create own timesheets.
-   `timesheet.update.self`: Update own timesheets.
-   `timesheet.submit.self`: Submit own timesheets.
-   `timesheet.view.team`: View timesheets of team members.
-   `timesheet.approve.team`: Approve team members' timesheets.
-   `timesheet.reject.team`: Reject team members' timesheets.
-   `timesheet.comment.team`: Add comments to team members' timesheets.
-   `timesheet.view.org`: View timesheets across the entire company.
-   `timesheet.correct.org`: Correct timesheet entries across the entire company (e.g., HR corrections).
-   `timesheet.lock.period`: Lock timesheet periods for the company.
-   `timesheet.export.org`: Export timesheet data for the company.

### Codes/Schedules/Policies
-   `actioncode.view`: View action codes.
-   `actioncode.manage`: Manage (create, update, delete) action codes.
-   `schedule.view`: View schedules.
-   `schedule.manage`: Manage (create, update, delete) schedules.
-   `policy.view`: View company policies.
-   `policy.manage`: Manage (create, update, delete) company policies.

### People & Teams
-   `user.view.team`: View team members' user profiles.
-   `user.view.org`: View user profiles across the entire company.
-   `team.manage`: Manage teams (create, update, delete).
-   `user.manage`: Manage user profiles (create, update, delete) within the company.

### Reports
-   `report.view.team`: View team-specific reports.
-   `report.view.org`: View company-wide reports.

### System (Company Admin)
-   `rbac.manage.company`: Manage roles and permissions for the company.
-   `settings.manage.company`: Manage company-specific settings.
-   `menu.manage.company`: Manage the Timesheet Hub menu (categories and cards) for the company.
-   `audit.view.company`: View audit logs for the company.

## 3. Baseline Role-to-Permission Mapping (Per Company)

This section defines the default permissions assigned to each role within a company.

-   **`employee`**
    -   `timesheet.view.self`
    -   `timesheet.create.self`
    -   `timesheet.update.self`
    -   `timesheet.submit.self`
    -   `actioncode.view`
    -   `schedule.view`
    -   `policy.view`

-   **`manager`**
    -   *Inherits all `employee` permissions*
    -   `timesheet.view.team`
    -   `timesheet.approve.team`
    -   `timesheet.reject.team`
    -   `timesheet.comment.team`
    -   `report.view.team`
    -   `user.view.team`

-   **`hr`**
    -   *Inherits all `manager` permissions*
    -   `timesheet.view.org`
    -   `timesheet.correct.org`
    -   `schedule.manage`
    -   `actioncode.manage`
    -   `report.view.org`
    -   `user.view.org`
    -   `user.manage`
    -   `team.manage`

-   **`payroll`**
    -   `timesheet.view.org`
    -   `timesheet.lock.period`
    -   `timesheet.export.org`
    -   `report.view.org`

-   **`auditor`**
    -   `timesheet.view.org`
    -   `actioncode.view`
    -   `schedule.view`
    -   `policy.view`
    -   `user.view.org`
    -   `report.view.org`
    -   `audit.view.company`

-   **`company_admin`**
    -   *Inherits all `hr` permissions*
    -   *Inherits all `payroll` permissions*
    -   *Inherits all `auditor` permissions*
    -   `rbac.manage.company`
    -   `settings.manage.company`
    -   `menu.manage.company`
    -   `audit.view.company`

## 4. Company Scope Clarification

All permissions and role assignments are strictly bound to a `company_id`. A user's effective permissions are always evaluated in the context of the company they are currently operating within. This ensures that managers only see their team within their company, HR can only correct timesheets for their company, and company admins can only manage settings for their specific company. There is no mechanism for a user to gain permissions across multiple companies unless explicitly assigned roles in each respective company.