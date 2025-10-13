# BaseEntity

## Overview

The `BaseEntity` serves as the foundational class for all other entities within the GoGoTime application. It encapsulates common fields and behaviors that are universally required across most database tables, promoting consistency, reducing boilerplate code, and simplifying auditing and soft-deletion strategies.

This abstract class is defined in `App.API/Entities/BaseEntity.ts`.

## Entity Definition

```typescript
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

/**
 * @description Base entity providing common fields for all entities in the application.
 * Includes UUID primary key, versioning, creation/update timestamps, and soft-delete capabilities.
 */
export abstract class BaseEntity {
  /**
   * @description Unique identifier for the entity, generated as a UUID.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @PrimaryGeneratedColumn("uuid") id!: string;

  /**
   * @description Version number for optimistic locking.
   * Incremented automatically on each update.
   * @example 1
   */
  @VersionColumn() version!: number;

  /**
   * @description Timestamp when the entity was created.
   * Automatically set on creation.
   * @example "2023-10-27T10:00:00Z"
   */
  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "now()",
  })
  createdAt!: Date;

  /**
   * @description Timestamp when the entity was last updated.
   * Automatically updated on each save.
   * @example "2023-10-27T11:30:00Z"
   */
  @UpdateDateColumn({ type: "timestamp with time zone" }) updatedAt!: Date;

  /**
   * @description Timestamp when the entity was soft-deleted.
   * Null if the entity is not deleted.
   * @example "2023-10-27T12:00:00Z"
   */
  @DeleteDateColumn({ type: "timestamp with time zone", nullable: true })
  deletedAt?: Date;

  /**
   * @description ID of the user who created the entity.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid", nullable: true }) createdByUserId?: string;

  /**
   * @description ID of the user who last updated the entity.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid", nullable: true }) updatedByUserId?: string;
}
```

## Columns

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `id`             | `UUID`               | Primary Key, auto-generated unique identifier for the entity.             |
| `version`        | `int`                | Used for optimistic locking, automatically incremented on updates.        |
| `createdAt`      | `TIMESTAMPTZ`        | Timestamp when the entity record was created.                             |
| `updatedAt`      | `TIMESTAMPTZ`        | Timestamp when the entity record was last updated.                        |
| `deletedAt`      | `TIMESTAMPTZ` (nullable) | Timestamp when the entity was soft-deleted. `NULL` if not deleted.        |
| `createdByUserId`| `UUID` (nullable)    | The ID of the user who created this entity.                               |
| `updatedByUserId`| `UUID` (nullable)    | The ID of the user who last updated this entity.                          |

## Usage

All other entities in the application extend `BaseEntity` to inherit these common fields. This ensures a consistent data model and simplifies CRUD operations, as TypeORM automatically handles `createdAt`, `updatedAt`, `deletedAt`, and `version` fields.