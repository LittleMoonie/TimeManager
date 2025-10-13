# Company Entity

## Overview

The `Company` entity is the central component for multi-tenancy within the GoGoTime application. Each company represents an independent organization with its own users, roles, teams, and data. This entity facilitates data isolation and provides a foundational structure for managing organizational units.

This entity is defined in `App.API/Entities/Companies/Company.ts`.

## Entity Definition

```typescript
import { Column, Entity, Index, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "../Users/User";
import { Team, TeamMember } from "./Team";
import { ActionCode } from "../Timesheets/ActionCode";
import { TimesheetEntry } from "../Timesheets/TimesheetEntry";
import { TimesheetHistory } from "../Timesheets/TimesheetHistory";
import { CompanySettings } from "./CompanySettings";

/**
 * @description Represents a company in the system.
 */
@Entity("companies")
@Index(["id"])
@Index(["name"], { unique: true })
export class Company extends BaseEntity {
  /**
   * @description The name of the company.
   * @example "Acme Corp"
   */
  @Column({ type: "varchar", length: 255 })
  name!: string;

  /**
   * @description The timezone of the company (e.g., "America/New_York").
   * @example "America/New_York"
   */
  @Column({ type: "varchar", length: 255, nullable: true }) timezone?: string;

  /**
   * @description List of users belonging to this company.
   */
  @OneToMany(() => User, (user) => user.company) users!: User[];
  /**
   * @description List of teams within this company.
   */
  @OneToMany(() => Team, (team) => team.company) teams!: Team[];
  /**
   * @description List of action codes defined for this company.
   */
  @OneToMany(() => ActionCode, (a) => a.company) actionCodes!: ActionCode[];
  /**
   * @description List of timesheet entries associated with this company.
   */
  @OneToMany(() => TimesheetEntry, (e) => e.company)
  timesheetEntries!: TimesheetEntry[];
  /**
   * @description List of team members associated with this company.
   */
  @OneToMany(() => TeamMember, (tm) => tm.company) teamMembers!: TeamMember[];
  /**
   * @description List of timesheet history records for this company.
   */
  @OneToMany(() => TimesheetHistory, (th) => th.company)
  timesheetHistory!: TimesheetHistory[];

  /**
   * @description Company-specific settings.
   */
  @OneToOne(() => CompanySettings, (settings) => settings.company)
  companySettings!: CompanySettings;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `Company` entity includes:

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `name`           | `VARCHAR(255)`       | The name of the company. Must be unique.                                  |
| `timezone`       | `VARCHAR(255)` (nullable) | The primary timezone for the company (e.g., `America/New_York`).          |

## Relations

*   **`users`**: `@OneToMany` relationship with `User` entity, representing all users belonging to this company.
*   **`teams`**: `@OneToMany` relationship with `Team` entity, representing all teams within this company.
*   **`actionCodes`**: `@OneToMany` relationship with `ActionCode` entity, representing all action codes defined for this company.
*   **`timesheetEntries`**: `@OneToMany` relationship with `TimesheetEntry` entity, representing all timesheet entries associated with this company.
*   **`teamMembers`**: `@OneToMany` relationship with `TeamMember` entity, representing all team members associated with this company.
*   **`timesheetHistory`**: `@OneToMany` relationship with `TimesheetHistory` entity, representing all timesheet history records for this company.
*   **`companySettings`**: `@OneToOne` relationship with `CompanySettings` entity, holding company-specific configurations.

## Indexes

To optimize query performance and ensure data integrity, the `Company` entity defines the following indexes:

*   `@Index(["id"])`: Primary index on the ID column.
*   `@Index(["name"], { unique: true })`: Ensures that company names are unique.

## Constraints

*   **Unique Name**: Ensures that no two companies can have the same name.
*   **Referential Integrity**: Relationships with other entities (e.g., `User`, `Team`) are managed with `onDelete: "RESTRICT"` to prevent accidental deletion of dependent records.