# Team Entity

## Overview

The `Team` entity represents a logical grouping of users within a `Company`. Teams are used to organize employees, assign responsibilities, and manage access to specific resources or projects. This entity is crucial for structuring the workforce within each company.

This entity is defined in `App.API/Entities/Companies/Team.ts`.

## Entity Definition

```typescript
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity }nimport { Company } from "./Company";
import User from "../Users/User";

/**
 * @description Represents a team within a company.
 */
@Entity("teams")
@Index(["companyId", "id", "name"], { unique: true })
export class Team extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this team belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this team.
   */
  @ManyToOne(() => Company, (company) => company.teams, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The name of the team.
   * @example "Engineering"
   */
  @Column({ type: "varchar", length: 255 }) name!: string;

  /**
   * @description List of members belonging to this team.
   */
  @OneToMany(() => TeamMember, (tm) => tm.team)
  members!: TeamMember[];
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `Team` entity includes:

| Column Name | Type           | Description                                                        |
| :---------- | :------------- | :----------------------------------------------------------------- |
| `companyId` | `UUID`         | Foreign Key to `Company.id`, linking the team to its organization. |
| `name`      | `VARCHAR(255)` | The name of the team. Must be unique within a company.             |

## Relations

- **`company`**: `@ManyToOne` relationship with `Company` entity.
- **`members`**: `@OneToMany` relationship with `TeamMember` entity, representing all users who are part of this team.

## Indexes

To optimize query performance and ensure data integrity, the `Team` entity defines the following index:

- `@Index(["companyId", "id", "name"], { unique: true })`: Ensures that the combination of company ID, team ID, and team name is unique.

## Constraints

- **Unique Team Name**: Ensures that no two teams within the same company can have the same name.
- **Foreign Keys**: Enforced for `companyId` to maintain referential integrity with the `Company` entity. `onDelete: "RESTRICT"` prevents deletion of a company if teams are still associated with it.
