# Permission Entity

## Overview

The `Permission` entity represents a specific authorization rule that can be granted to roles within a company. Each permission defines a distinct capability (e.g., `create_user`, `delete_timesheet`). These permissions are then assigned to `Role` entities, forming the basis of the Role-Based Access Control (RBAC) system.

This entity is defined in `App.API/Entities/Roles/Permission.ts`.

## Entity Definition

```typescript
import { Entity, Column, OneToMany, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { RolePermission } from './RolePermission';
import { Company } from '../Companies/Company';

/**
 * @description Represents a specific permission that can be assigned to roles within a company.
 */
@Entity('permissions')
@Index(['companyId', 'id'], { unique: true })
@Index(['companyId', 'name'], { unique: true })
export class Permission extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this permission belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this permission.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The name of the permission (e.g., "create_user", "delete_timesheet").
   * @example "create_user"
   */
  @Column({ type: 'varchar', length: 100, nullable: false }) name!: string;
  /**
   * @description Optional: A detailed description of what this permission allows.
   * @example "Allows creation of new user accounts"
   */
  @Column({ type: 'text', nullable: true }) description?: string;

  /**
   * @description List of role-permission associations for this permission.
   */
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermission[];
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `Permission` entity includes:

| Column Name   | Type              | Description                                                                               |
| :------------ | :---------------- | :---------------------------------------------------------------------------------------- |
| `companyId`   | `UUID`            | Foreign Key to `Company.id`, linking the permission to its organization.                  |
| `name`        | `VARCHAR(100)`    | The unique name of the permission (e.g., `create_user`). Must be unique within a company. |
| `description` | `TEXT` (nullable) | Optional detailed description of what this permission allows.                             |

## Relations

- **`company`**: `@ManyToOne` relationship with `Company` entity.
- **`rolePermissions`**: `@OneToMany` relationship with `RolePermission` entity, representing the roles that have this permission.

## Indexes

To optimize query performance and ensure data integrity, the `Permission` entity defines the following indexes:

- `@Index(["companyId", "id"], { unique: true })`: Ensures a unique permission ID within each company.
- `@Index(["companyId", "name"], { unique: true })`: Ensures permission names are unique within each company.

## Constraints

- **Unique Permission Name**: No two permissions within the same company can have the same name.
- **Foreign Keys**: Enforced for `companyId` to maintain referential integrity with the `Company` entity. `onDelete: "RESTRICT"` prevents deletion of a company if permissions are still associated with it.
