# User Entity

## Overview

The `User` entity represents a user account within the GoGoTime application. It stores essential user information, authentication credentials, and links to their associated company, role, and status. This entity is central to managing access, permissions, and personal data within the system.

This entity is defined in `App.API/Entities/Users/User.ts`.

## Entity Definition

```typescript
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import { Role } from '../Roles/Role';
import { UserStatus } from './UserStatus';
import ActiveSession from './ActiveSessions';

/**
 * @description Represents a user in the system.
 */
@Entity('users')
@Index(['companyId', 'id'])
@Index(['companyId', 'email'], { unique: true })
@Index(['companyId', 'roleId'])
@Index(['companyId', 'statusId'])
export default class User extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this user belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this user.
   */
  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The user's email address, unique within the company.
   * @example "john.doe@example.com"
   */
  @Column({ type: 'citext', nullable: false }) email!: string;

  /**
   * @description The first name of the user.
   * @example "John"
   */
  @Column({ type: 'varchar', length: 255, nullable: false }) firstName!: string;
  /**
   * @description The last name of the user.
   * @example "Doe"
   */
  @Column({ type: 'varchar', length: 255, nullable: false }) lastName!: string;

  /**
   * @description The hashed password of the user.
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash!: string;
  /**
   * @description Indicates if the user must change their password at the next login.
   * @example false
   */
  @Column({ type: 'boolean', default: false })
  mustChangePasswordAtNextLogin!: boolean;

  /**
   * @description The unique identifier of the role assigned to the user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: false }) roleId!: string;
  /**
   * @description The role assigned to the user.
   */
  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'roleId', referencedColumnName: 'id' },
    { name: 'companyId', referencedColumnName: 'companyId' },
  ])
  role!: Role;

  /**
   * @description Optional: The user's phone number in E.164 format.
   * @example "+15551234567"
   */
  @Column({ type: 'varchar', length: 32, nullable: true }) phoneNumber?: string;

  /**
   * @description Optional: The timestamp of the user's last successful login.
   * @example "2023-10-27T11:30:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin?: Date;
  /**
   * @description Indicates if the user's data has been anonymized.
   * @example false
   */
  @Column({ default: false }) isAnonymized!: boolean;

  /**
   * @description List of active sessions for this user.
   */
  @OneToMany(() => ActiveSession, (s) => s.user)
  activeSessions!: ActiveSession[];

  /**
   * @description The unique identifier of the user's current status.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: false }) statusId!: string;
  /**
   * @description The user's current status.
   */
  @ManyToOne(() => UserStatus, (s) => s.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status!: UserStatus;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `User` entity includes:

| Column Name                     | Type                     | Description                                                          |
| :------------------------------ | :----------------------- | :------------------------------------------------------------------- |
| `companyId`                     | `UUID`                   | Foreign Key to `Company.id`, linking the user to their organization. |
| `email`                         | `CITEXT`                 | User's email address, unique within a company.                       |
| `firstName`                     | `VARCHAR(255)`           | User's first name.                                                   |
| `lastName`                      | `VARCHAR(255)`           | User's last name.                                                    |
| `passwordHash`                  | `VARCHAR(255)`           | Hashed password for authentication.                                  |
| `mustChangePasswordAtNextLogin` | `BOOLEAN`                | Indicates if the user must change their password on next login.      |
| `roleId`                        | `UUID`                   | Foreign Key to `Role.id`, defining the user's role and permissions.  |
| `phoneNumber`                   | `VARCHAR(32)` (nullable) | Optional phone number in E.164 format.                               |
| `lastLogin`                     | `TIMESTAMPTZ` (nullable) | Timestamp of the user's last successful login.                       |
| `isAnonymized`                  | `BOOLEAN`                | Flag indicating if the user's data has been anonymized.              |
| `statusId`                      | `UUID`                   | Foreign Key to `UserStatus.id`, defining the user's current status.  |

## Relations

- **`company`**: `@ManyToOne` relationship with `Company` entity.
- **`role`**: `@ManyToOne` relationship with `Role` entity.
- **`status`**: `@ManyToOne` relationship with `UserStatus` entity.
- **`activeSessions`**: `@OneToMany` relationship with `ActiveSession` entity, tracking all active login sessions for the user.

## Indexes

To optimize query performance and ensure data integrity, the `User` entity defines the following indexes:

- `@Index(["companyId", "id"])`: Composite index for efficient lookups by user ID within a company.
- `@Index(["companyId", "email"], { unique: true })`: Unique composite index to ensure email uniqueness within each company.
- `@Index(["companyId", "roleId"])`: For efficient filtering by role within a company.
- `@Index(["companyId", "statusId"])`: For efficient filtering by status within a company.

## Constraints

- **Unique Email**: Ensures that no two users within the same company can have the same email address.
- **Foreign Keys**: Enforced for `companyId`, `roleId`, and `statusId` to maintain referential integrity with `Company`, `Role`, and `UserStatus` entities, respectively. `onDelete: "RESTRICT"` prevents deletion of referenced entities.
