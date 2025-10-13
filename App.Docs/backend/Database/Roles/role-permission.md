# RolePermission Entity

## Overview

The `RolePermission` entity represents the many-to-many relationship between `Role` and `Permission` entities within a company. It acts as a join table, linking specific roles to the permissions they possess. This is a core component of the Role-Based Access Control (RBAC) system.

This entity is defined in `App.API/Entities/Roles/RolePermission.ts`.

## Entity Definition

```typescript
import { Entity, ManyToOne, JoinColumn, Index, Column } from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";
import { Company } from "../Companies/Company";
import { BaseEntity } from "../BaseEntity";

/**
 * @description Represents the many-to-many relationship between roles and permissions within a company.
 */
@Entity("role_permissions")
@Index(["companyId", "roleId", "permissionId"], { unique: true })
export class RolePermission extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this role-permission association belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this role-permission.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the role in this association.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) roleId!: string;
  /**
   * @description The role in this association.
   */
  @ManyToOne(() => Role, { onDelete: "RESTRICT" })
  @JoinColumn([
    { name: "roleId", referencedColumnName: "id" },
    { name: "companyId", referencedColumnName: "companyId" },
  ])
  role!: Role;

  /**
   * @description The unique identifier of the permission in this association.
   * @example "p1e2r3m4-i5s6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) permissionId!: string;
  /**
   * @description The permission in this association.
   */
  @ManyToOne(() => Permission, { onDelete: "RESTRICT" })
  @JoinColumn([
    { name: "permissionId", referencedColumnName: "id" },
    { name: "companyId", referencedColumnName: "companyId" },
  ])
  permission!: Permission;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `RolePermission` entity includes:

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `companyId`      | `UUID`               | Foreign Key to `Company.id`, linking the association to its organization. |
| `roleId`         | `UUID`               | Foreign Key to `Role.id`, identifying the role in the association.        |
| `permissionId`   | `UUID`               | Foreign Key to `Permission.id`, identifying the permission in the association. |

## Relations

*   **`company`**: `@ManyToOne` relationship with `Company` entity.
*   **`role`**: `@ManyToOne` relationship with `Role` entity, with a composite `JoinColumn` to ensure the role belongs to the same company.
*   **`permission`**: `@ManyToOne` relationship with `Permission` entity, with a composite `JoinColumn` to ensure the permission belongs to the same company.

## Indexes

To optimize query performance and ensure data integrity, the `RolePermission` entity defines the following index:

*   `@Index(["companyId", "roleId", "permissionId"], { unique: true })`: Ensures that a specific role can only have a specific permission once within a given company.

## Constraints

*   **Unique Role-Permission Pair**: A role can only be assigned a particular permission once within a company.
*   **Foreign Keys**: Enforced for `companyId`, `roleId`, and `permissionId` to maintain referential integrity with `Company`, `Role`, and `Permission` entities, respectively. `onDelete: "RESTRICT"` prevents deletion of referenced entities.