# CompanySettings Entity

## Overview

The `CompanySettings` entity stores various configuration options specific to each company. This allows for flexible customization of application behavior, such as timezones, work week definitions, holiday calendars, and user registration policies, on a per-company basis.

This entity is defined in `App.API/Entities/Companies/CompanySettings.ts`.

## Entity Definition

```typescript
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Company } from './Company';
import { BaseEntity } from '../BaseEntity';

/**
 * @description Defines the possible policies for timesheet approvers.
 */
export enum ApproverPolicy {
  MANAGER_OF_USER = 'manager_of_user',
  ROLE_MANAGER = 'role_manager',
  EXPLICIT = 'explicit',
}

/**
 * @description Represents the settings for a specific company.
 */
@Entity('company_settings')
export class CompanySettings extends BaseEntity {
  /**
   * @description The unique identifier of the company these settings belong to.
   * This also serves as the primary key.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @PrimaryColumn('uuid')
  companyId!: string;

  /**
   * @description The company associated with these settings.
   */
  @OneToOne(() => Company, (company) => company.companySettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The timezone of the company (e.g., "UTC", "America/New_York").
   * @example "UTC"
   */
  @Column({ type: 'text', default: 'UTC' }) timezone!: string;
  /**
   * @description Configuration for the company's work week, typically mapping days to work hours.
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  @Column({ type: 'jsonb', default: () => `'{}'` }) workWeek!: Record<string, number[]>;
  /**
   * @description Optional: Identifier for the holiday calendar used by the company.
   * @example "us_federal_holidays"
   */
  @Column({ type: 'text', nullable: true }) holidayCalendar?: string;

  /**
   * @description The policy used for timesheet approvals within the company.
   * @example "manager_of_user"
   */
  @Column({
    type: 'varchar',
    length: 32,
    default: ApproverPolicy.MANAGER_OF_USER,
  })
  timesheetApproverPolicy!: ApproverPolicy;

  /**
   * @description Optional: An array of email domains allowed for new user registrations.
   * @example ["example.com", "another.org"]
   */
  @Column({ type: 'text', array: true, nullable: true })
  allowedEmailDomains?: string[];

  /**
   * @description Indicates whether new user registrations must use an email from `allowedEmailDomains`.
   * @example false
   */
  @Column({ type: 'boolean', default: false }) requireCompanyEmail!: boolean;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `CompanySettings` entity includes:

| Column Name               | Type                | Description                                                                              |
| :------------------------ | :------------------ | :--------------------------------------------------------------------------------------- |
| `companyId`               | `UUID`              | Primary Key and Foreign Key to `Company.id`.                                             |
| `timezone`                | `TEXT`              | The default timezone for the company (e.g., `UTC`, `America/New_York`).                  |
| `workWeek`                | `JSONB`             | Configuration for the company's work week (e.g., `{ "monday": [9, 17] }`).               |
| `holidayCalendar`         | `TEXT` (nullable)   | Optional identifier for the holiday calendar used by the company.                        |
| `timesheetApproverPolicy` | `VARCHAR(32)`       | The policy used for timesheet approvals (`manager_of_user`, `role_manager`, `explicit`). |
| `allowedEmailDomains`     | `TEXT[]` (nullable) | Array of email domains allowed for new user registrations.                               |
| `requireCompanyEmail`     | `BOOLEAN`           | Indicates if new user registrations must use an allowed email domain.                    |

## Relations

- **`company`**: `@OneToOne` relationship with `Company` entity. `onDelete: "CASCADE"` ensures that if a company is deleted, its settings are also removed.

## Indexes

No specific indexes are defined on `CompanySettings` beyond the primary key `companyId`.

## Constraints

- **Primary Key**: `companyId` serves as both the primary key and a foreign key, ensuring a one-to-one relationship with the `Company` entity.
- **Foreign Key**: Enforced for `companyId` to maintain referential integrity with the `Company` entity. `onDelete: "CASCADE"` ensures that if a company is deleted, its settings are automatically removed.
