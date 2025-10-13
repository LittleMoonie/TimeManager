# UserStatus Entity

## Overview

The `UserStatus` entity defines the possible states a user account can be in (e.g., `ACTIVE`, `SUSPENDED`, `TERMINATED`). These statuses control various aspects of user behavior, such as login access and whether the account is considered terminal. This entity is crucial for managing the lifecycle and permissions of user accounts.

This entity is defined in `App.API/Entities/Users/UserStatus.ts`.

## Entity Definition

```typescript
import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "./User";

/**
 * @description Represents a status that can be assigned to a user, controlling their access and behavior.
 */
@Entity("user_statuses")
export class UserStatus extends BaseEntity {
  /**
   * @description A unique machine-readable code for the user status (e.g., "ACTIVE", "SUSPENDED").
   * @example "ACTIVE"
   */
  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  code!: string; // e.g. INVITED, ACTIVE, SUSPENDED, TERMINATED

  /**
   * @description The human-readable display name for the user status.
   * @example "Active"
   */
  @Column({ type: "varchar", length: 50, unique: true, nullable: false })
  name!: string; // Display label

  /**
   * @description Optional: A detailed description of what this user status signifies.
   * @example "User is currently active and can log in."
   */
  @Column({ type: "text", nullable: true }) description?: string;

  /**
   * @description Indicates whether users with this status are allowed to log in.
   * @example true
   */
  @Column({ type: "boolean", default: true }) canLogin!: boolean;
  /**
   * @description Indicates whether this status is a terminal status (e.g., "terminated", "archived"), meaning further actions might be restricted.
   * @example false
   */
  @Column({ type: "boolean", default: false }) isTerminal!: boolean;

  /**
   * @description List of users currently assigned to this status.
   */
  @OneToMany(() => User, (user) => user.status)
  users!: User[];
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `UserStatus` entity includes:

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `code`           | `VARCHAR(50)`        | A unique machine-readable code for the status (e.g., `ACTIVE`, `SUSPENDED`). |
| `name`           | `VARCHAR(50)`        | The human-readable display name for the status.                           |
| `description`    | `TEXT` (nullable)    | Optional detailed description of what this status signifies.              |
| `canLogin`       | `BOOLEAN`            | Indicates whether users with this status are allowed to log in.           |
| `isTerminal`     | `BOOLEAN`            | Indicates whether this is a terminal status (e.g., `terminated`, `archived`). |

## Relations

*   **`users`**: `@OneToMany` relationship with `User` entity, representing all users currently assigned to this status.

## Indexes

No specific indexes are defined on `UserStatus` beyond the primary key, but a unique constraint is enforced on the `code` and `name` columns.

## Constraints

*   **Unique Code and Name**: Ensures that each user status has a unique code and name.
*   **Referential Integrity**: `User` entities reference `UserStatus` via a foreign key. `onDelete: "RESTRICT"` prevents deletion of a status if users are still assigned to it.