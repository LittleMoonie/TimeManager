# TeamMember Entity

## Overview

The `TeamMember` entity represents the association between a `User` and a `Team` within a specific `Company`. It defines which users belong to which teams and can also store team-specific roles (e.g., "member", "lead"). This entity is crucial for managing team memberships and access within organizational structures.

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
import { BaseEntity } from "../BaseEntity";
import { Company } from "./Company";
import User from "../Users/User";

/**
 * @description Represents a member of a team, linking a user to a team within a company.
 */
@Entity("team_members")
@Index(["companyId", "teamId", "userId"], { unique: true })
export class TeamMember extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this team member association belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this team member.
   */
  @ManyToOne(() => Company, (c) => c.teamMembers, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the team this member belongs to.
   * @example "g1h2i3j4-k5l6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) teamId!: string;

  /**
   * @description The team this member belongs to.
   */
  @ManyToOne(() => Team, (team) => team.members, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "teamId" })
  team!: Team;

  /**
   * @description The unique identifier of the user who is a member of the team.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) userId!: string;

  /**
   * @description The user who is a member of the team.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description The role of the user within the team (e.g., "member", "lead").
   * @example "member"
   */
  @Column({ type: "varchar", length: 50, default: "member" })
  role!: string; // team-level role (lead/member)
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `TeamMember` entity includes:

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `companyId`      | `UUID`               | Foreign Key to `Company.id`, linking the team member to its organization. |
| `teamId`         | `UUID`               | Foreign Key to `Team.id`, identifying the team the user belongs to.       |
| `userId`         | `UUID`               | Foreign Key to `User.id`, identifying the user who is a member.           |
| `role`           | `VARCHAR(50)`        | The role of the user within the team (e.g., "member", "lead").          |

## Relations

*   **`company`**: `@ManyToOne` relationship with `Company` entity.
*   **`team`**: `@ManyToOne` relationship with `Team` entity.
*   **`user`**: `@ManyToOne` relationship with `User` entity.

## Indexes

To optimize query performance and ensure data integrity, the `TeamMember` entity defines the following index:

*   `@Index(["companyId", "teamId", "userId"], { unique: true })`: Ensures that a user can only be a member of a specific team once within a given company.

## Constraints

*   **Unique Membership**: A user can only be a member of a specific team once within a company.
*   **Foreign Keys**: Enforced for `companyId`, `teamId`, and `userId` to maintain referential integrity with `Company`, `Team`, and `User` entities, respectively. `onDelete: "RESTRICT"` prevents deletion of referenced entities.