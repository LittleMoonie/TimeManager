# Database Strategy & Operations

## Overview

This document outlines the database strategy for the NCY_8 platform, including schema design, migration management, performance optimization, backup procedures, and compliance requirements.

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3+
- **Connection Pooling**: Built-in PostgreSQL driver
- **Backup**: pg_dump with point-in-time recovery
- **Monitoring**: postgres_exporter + Prometheus

### Database Design Principles

1. **Normalization**: Third normal form with strategic denormalization
2. **UUID Primary Keys**: Better distribution and security
3. **Soft Deletes**: Audit trails and data recovery
4. **Audit Logging**: Comprehensive change tracking
5. **Multi-tenancy**: Company-based data isolation

## Schema Design

### Core Identity Tables

```typescript
// App.API/Entities/Users/User.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";
import { Role } from "../Roles/Role";
import { UserStatus } from "./UserStatus";
import ActiveSession from "./ActiveSessions";

/**
 * @description Represents a user in the system.
 */
@Entity("users")
@Index(["companyId", "id"])
@Index(["companyId", "email"], { unique: true })
@Index(["companyId", "roleId"])
@Index(["companyId", "statusId"])
export default class User extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this user belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this user.
   */
  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The user's email address, unique within the company.
   * @example "john.doe@example.com"
   */
  @Column({ type: "citext", nullable: false }) email!: string;

  /**
   * @description The first name of the user.
   * @example "John"
   */
  @Column({ type: "varchar", length: 255, nullable: false }) firstName!: string;
  /**
   * @description The last name of the user.
   * @example "Doe"
   */
  @Column({ type: "varchar", length: 255, nullable: false }) lastName!: string;

  /**
   * @description The hashed password of the user.
   */
  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;
  /**
   * @description Indicates if the user must change their password at the next login.
   * @example false
   */
  @Column({ type: "boolean", default: false })
  mustChangePasswordAtNextLogin!: boolean;

  /**
   * @description The unique identifier of the role assigned to the user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid", nullable: false }) roleId!: string;
  /**
   * @description The role assigned to the user.
   */
  @ManyToOne(() => Role, (role) => role.users, { onDelete: "RESTRICT" })
  @JoinColumn([
    { name: "roleId", referencedColumnName: "id" },
    { name: "companyId", referencedColumnName: "companyId" },
  ])
  role!: Role;

  /**
   * @description Optional: The user's phone number in E.164 format.
   * @example "+15551234567"
   */
  @Column({ type: "varchar", length: 32, nullable: true }) phoneNumber?: string;

  /**
   * @description Optional: The timestamp of the user's last successful login.
   * @example "2023-10-27T11:30:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
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
  @Column({ type: "uuid", nullable: false }) statusId!: string;
  /**
   * @description The user's current status.
   */
  @ManyToOne(() => UserStatus, (s) => s.users, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "statusId" })
  status!: UserStatus;
}
```

```typescript
// App.API/Entities/Users/ActiveSessions.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "./User";
import { Company } from "../Companies/Company";

/**
 * @description Represents an active user session, typically linked to a refresh token.
 */
@Entity("active_sessions")
@Index(["companyId", "userId"])
@Index(["tokenHash"], { unique: true })
@Index(["expiresAt"])
export default class ActiveSession extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this active session belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this active session.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the user associated with this active session.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) userId!: string;

  /**
   * @description The user associated with this active session.
   */
  @ManyToOne(() => User, (user) => user.activeSessions, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description The SHA-256 hash of the refresh token.
   * @example "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
   */
  @Column({ type: "text" }) tokenHash!: string;
  /**
   * @description Optional: The hash of the previous refresh token, used for refresh token rotation.
   * @example "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
   */
  @Column({ type: "text", nullable: true }) previousTokenHash?: string;

  /**
   * @description Optional: The expiration date and time of the refresh token.
   * @example "2024-01-01T10:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  expiresAt?: Date;
  /**
   * @description Optional: The date and time when the session was revoked.
   * @example "2024-01-01T09:30:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  revokedAt?: Date;
  /**
   * @description Optional: The date and time when the session was last seen active.
   * @example "2024-01-01T09:45:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  lastSeenAt?: Date;

  /**
   * @description Optional: The IP address from which the session originated.
   * @example "192.168.1.100"
   */
  @Column({ type: "inet", nullable: true }) ip?: string;
  /**
   * @description Optional: The user agent string of the client that initiated the session.
   * @example "Mozilla/5.0 (Windows NT 10.0)"
   */
  @Column({ type: "text", nullable: true }) userAgent?: string;
  /**
   * @description Optional: A unique identifier for the device associated with the session.
   * @example "d1e2v3i4-c5e6i7d8-9012-3456-7890abcdef"
   */
  @Column({ type: "text", nullable: true }) deviceId?: string;
}
```

```typescript
// App.API/Entities/Users/UserStatus.ts
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

### RBAC System

```typescript
// App.API/Entities/Roles/Role.ts
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolePermission } from "./RolePermission";
import User from "../Users/User";
import { Company } from "../Companies/Company";

/**
 * @description Represents a user role within a company, defining a set of permissions.
 */
@Entity("roles")
@Index(["companyId", "id"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Role extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this role belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this role.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The name of the role (e.g., "Admin", "Manager", "Employee").
   * @example "Admin"
   */
  @Column({ type: "varchar", length: 50, nullable: false }) name!: string;
  /**
   * @description Optional: A detailed description of the role's responsibilities or privileges.
   * @example "Administrator with full access to all company resources."
   */
  @Column({ type: "text", nullable: true }) description?: string;

  /**
   * @description List of permissions assigned to this role.
   */
  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions!: RolePermission[];
  /**
   * @description List of users assigned to this role.
   */
  @OneToMany(() => User, (user) => user.role) users!: User[];
}
```

```typescript
// App.API/Entities/Roles/Permission.ts
import {
  Entity,
  Column,
  OneToMany,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolePermission } from "./RolePermission";
import { Company } from "../Companies/Company";

/**
 * @description Represents a specific permission that can be assigned to roles within a company.
 */
@Entity("permissions")
@Index(["companyId", "id"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Permission extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this permission belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this permission.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The name of the permission (e.g., "create_user", "delete_timesheet").
   * @example "create_user"
   */
  @Column({ type: "varchar", length: 100, nullable: false }) name!: string;
  /**
   * @description Optional: A detailed description of what this permission allows.
   * @example "Allows creation of new user accounts"
   */
  @Column({ type: "text", nullable: true }) description?: string;

  /**
   * @description List of role-permission associations for this permission.
   */
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];
}
```

```typescript
// App.API/Entities/Roles/RolePermission.ts
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

### Company Structure

```typescript
// App.API/Entities/Companies/Company.ts
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

```typescript
// App.API/Entities/Companies/CompanySettings.ts
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Company } from "./Company";
import { BaseEntity } from "../BaseEntity";

/**
 * @description Defines the possible policies for timesheet approvers.
 */
export enum ApproverPolicy {
  MANAGER_OF_USER = "manager_of_user",
  ROLE_MANAGER = "role_manager",
  EXPLICIT = "explicit",
}

/**
 * @description Represents the settings for a specific company.
 */
@Entity("company_settings")
export class CompanySettings extends BaseEntity {
  /**
   * @description The unique identifier of the company these settings belong to.
   * This also serves as the primary key.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @PrimaryColumn("uuid")
  companyId!: string;

  /**
   * @description The company associated with these settings.
   */
  @OneToOne(() => Company, (company) => company.companySettings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The timezone of the company (e.g., "UTC", "America/New_York").
   * @example "UTC"
   */
  @Column({ type: "text", default: "UTC" }) timezone!: string;
  /**
   * @description Configuration for the company's work week, typically mapping days to work hours.
   * @example { "monday": [9, 17], "tuesday": [9, 17] }
   */
  @Column({ type: "jsonb", default: () => `'{}'` }) workWeek!: Record<
    string,
    number[]
  >;
  /**
   * @description Optional: Identifier for the holiday calendar used by the company.
   * @example "us_federal_holidays"
   */
  @Column({ type: "text", nullable: true }) holidayCalendar?: string;

  /**
   * @description The policy used for timesheet approvals within the company.
   * @example "manager_of_user"
   */
  @Column({
    type: "varchar",
    length: 32,
    default: ApproverPolicy.MANAGER_OF_USER,
  })
  timesheetApproverPolicy!: ApproverPolicy;

  /**
   * @description Optional: An array of email domains allowed for new user registrations.
   * @example ["example.com", "another.org"]
   */
  @Column({ type: "text", array: true, nullable: true })
  allowedEmailDomains?: string[];

  /**
   * @description Indicates whether new user registrations must use an email from `allowedEmailDomains`.
   * @example false
   */
  @Column({ type: "boolean", default: false }) requireCompanyEmail!: boolean;
}
```

```typescript
// App.API/Entities/Companies/Team.ts
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

### Business Entities

```typescript
// App.API/Entities/Companies/LeaveRequest.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "../Users/User";
import { Company } from "./Company";

/**
 * @description Defines the possible statuses for a leave request.
 */
export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

/**
 * @description Defines the possible types of leave.
 */
export enum LeaveType {
  PTO = "PTO",
  SICK = "SICK",
  UNPAID = "UNPAID",
}

/**
 * @description Represents a leave request made by a user within a company.
 */
@Entity("leave_requests")
@Index(["companyId", "userId"])
@Index(["companyId", "startDate", "endDate"])
export class LeaveRequest extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this leave request belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) companyId!: string;

  /**
   * @description The company associated with this leave request.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the user who made this leave request.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid" }) userId!: string;

  /**
   * @description The user who made this leave request.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description The start date of the leave request.
   * @example "2024-01-01"
   */
  @Column({ type: "date" }) startDate!: Date;
  /**
   * @description The end date of the leave request.
   * @example "2024-01-05"
   */
  @Column({ type: "date" }) endDate!: Date;

  /**
   * @description The type of leave being requested.
   * @example "PTO"
   */
  @Column({ type: "varchar", length: 20 }) leaveType!: LeaveType;

  /**
   * @description The current status of the leave request.
   * @example "PENDING"
   */
  @Column({ type: "varchar", length: 20, default: LeaveRequestStatus.PENDING })
  status!: LeaveRequestStatus;

  /**
   * @description Optional: A reason or description for the leave request.
   * @example "Annual vacation trip"
   */
  @Column({ type: "text", nullable: true }) reason?: string;
  /**
   * @description Optional: A reason for rejecting the leave request.
   * @example "Insufficient coverage"
   */
  @Column({ type: "text", nullable: true }) rejectionReason?: string;
}
```

```typescript
// App.API/Entities/Timesheets/ActionCode.ts
import { Column, Entity, ManyToOne, Index, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";

/**
 * @description Defines the type of an action code, indicating if it's billable or non-billable.
 */
export enum ActionCodeType {
  BILLABLE = "billable",
  NON_BILLABLE = "non-billable",
}

/**
 * @description Represents an action code used for categorizing timesheet entries within a company.
 */
@Entity("action_codes")
@Unique(["companyId", "code"])
@Index(["companyId", "code"])
export class ActionCode extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this action code belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;

  /**
   * @description The company associated with this action code.
   */
  @ManyToOne(() => Company, (c) => c.actionCodes, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description A unique short code for the action (e.g., "DEV", "MEETING").
   * @example "DEV"
   */
  @Column({ type: "varchar", length: 255 }) code!: string;
  /**
   * @description The display name of the action code (e.g., "Development", "Team Meeting").
   * @example "Development"
   */
  @Column({ type: "varchar", length: 255 }) name!: string;

  /**
   * @description The type of the action code, indicating if it's billable or non-billable.
   * @example "billable"
   */
  @Column({ type: "varchar", length: 16, default: ActionCodeType.BILLABLE })
  type!: ActionCodeType;

  /**
   * @description Indicates if the action code is currently active.
   * @example true
   */
  @Column({ type: "boolean", default: true }) active!: boolean;
}
```

```typescript
// App.API/Entities/Timesheets/Timesheet.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";
import User from "../Users/User";
import { TimesheetEntry } from "./TimesheetEntry";

/**
 * @description Defines the possible statuses for a timesheet.
 */
export enum TimesheetStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * @description Represents a timesheet submitted by a user for a specific period.
 */
@Entity("timesheets")
@Index(["companyId", "userId", "periodStart", "periodEnd"], { unique: true })
@Index(["companyId", "status"])
export class Timesheet extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;
  /**
   * @description The company associated with this timesheet.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the user who owns this timesheet.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column("uuid") userId!: string;
  /**
   * @description The user who owns this timesheet.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description The start date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-01"
   */
  @Column({ type: "date" }) periodStart!: string; // ISO date
  /**
   * @description The end date of the timesheet period in ISO date format (YYYY-MM-DD).
   * @example "2024-01-07"
   */
  @Column({ type: "date" }) periodEnd!: string;

  /**
   * @description The current status of the timesheet.
   * @example "DRAFT"
   */
  @Column({ type: "varchar", length: 16, default: TimesheetStatus.DRAFT })
  status!: TimesheetStatus;

  /**
   * @description Optional: Timestamp when the timesheet was submitted for approval.
   * @example "2024-01-08T10:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  submittedAt?: Date;
  /**
   * @description Optional: The unique identifier of the user who submitted the timesheet.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: "uuid", nullable: true }) submittedByUserId?: string;

  /**
   * @description Optional: Timestamp when the timesheet was approved.
   * @example "2024-01-09T11:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  approvedAt?: Date;
  /**
   * @description Optional: The unique identifier of the user who approved the timesheet.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  @Column({ type: "uuid", nullable: true }) approverId?: string;

  /**
   * @description The total duration in minutes of all entries in this timesheet.
   * This is a cached value for quick retrieval.
   * @example 480
   */
  @Column({ type: "int", default: 0 }) totalMinutes!: number; // roll-up cache
  /**
   * @description Optional: Any general notes or comments for the timesheet.
   * @example "Weekly report for Project Alpha"
   */
  @Column({ type: "text", nullable: true }) notes?: string;

  /**
   * @description List of individual timesheet entries belonging to this timesheet.
   */
  @OneToMany(() => TimesheetEntry, (e) => e.timesheet)
  entries!: TimesheetEntry[];
}
```

```typescript
// App.API/Entities/Timesheets/TimesheetApproval.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";
import { Timesheet } from "./Timesheet";
import User from "../Users/User";

/**
 * @description Defines the possible statuses for a timesheet approval.
 */
export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * @description Represents an approval record for a timesheet.
 */
@Entity("timesheet_approvals")
@Index(["companyId", "timesheetId", "approverId"], { unique: true })
export class TimesheetApproval extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet approval belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;
  /**
   * @description The company associated with this timesheet approval.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the timesheet being approved.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column("uuid") timesheetId!: string;
  /**
   * @description The timesheet associated with this approval.
   */
  @ManyToOne(() => Timesheet, { onDelete: "CASCADE" })
  @JoinColumn({ name: "timesheetId" })
  timesheet!: Timesheet;

  /**
   * @description The unique identifier of the user who is approving the timesheet.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  @Column("uuid") approverId!: string;
  /**
   * @description The user who is approving the timesheet.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "approverId" })
  approver!: User;

  /**
   * @description The current status of the timesheet approval.
   * @example "PENDING"
   */
  @Column({ type: "varchar", length: 16, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  /**
   * @description Optional: A reason or comment for the approval decision (e.g., rejection reason).
   * @example "Approved as submitted"
   */
  @Column({ type: "text", nullable: true }) reason?: string;
  /**
   * @description Optional: Timestamp when the approval decision was made.
   * @example "2024-01-08T10:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  decidedAt?: Date;
}
```

```typescript
// App.API/Entities/Timesheets/TimesheetEntry.ts
import { Column, Entity, ManyToOne, Check, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import User from "../Users/User";
import { Company } from "../Companies/Company";
import { ActionCode } from "./ActionCode";
import { Timesheet } from "./Timesheet";

/**
 * @description Defines the possible work modes for a timesheet entry.
 */
export enum WorkMode {
  OFFICE = "office",
  REMOTE = "remote",
  HYBRID = "hybrid",
}

/**
 * @description Represents a single entry within a timesheet, detailing work performed.
 */
@Entity("timesheet_entries")
@Check(`"durationMin" BETWEEN 0 AND 1440`)
@Index(["companyId", "userId", "day"])
@Index(["companyId", "timesheetId"])
export class TimesheetEntry extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet entry belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;
  /**
   * @description The company associated with this timesheet entry.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the user who made this timesheet entry.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column("uuid") userId!: string;
  /**
   * @description The user who made this timesheet entry.
   */
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;

  /**
   * @description Optional: The unique identifier of the timesheet this entry belongs to.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column("uuid", { nullable: true }) timesheetId?: string;
  /**
   * @description Optional: The timesheet this entry belongs to.
   */
  @ManyToOne(() => Timesheet, (t) => t.entries, { onDelete: "SET NULL" })
  @JoinColumn({ name: "timesheetId" })
  timesheet?: Timesheet;

  /**
   * @description The unique identifier of the action code associated with this entry.
   * @example "a1c2t3i4-o5n6-7890-1234-567890abcdef"
   */
  @Column("uuid") actionCodeId!: string;
  /**
   * @description The action code associated with this entry.
   */
  @ManyToOne(() => ActionCode, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "actionCodeId" })
  actionCode!: ActionCode;

  /**
   * @description The work mode for this entry (e.g., "office", "remote", "hybrid").
   * @example "office"
   */
  @Column({ type: "varchar", length: 8, default: WorkMode.OFFICE })
  workMode!: WorkMode;

  /**
   * @description The country code (ISO 3166-1 alpha-2) where the work was performed.
   * @example "US"
   */
  @Column({ type: "varchar", length: 2 }) country!: string;

  /**
   * @description Optional: Timestamp when the work for this entry started.
   * @example "2024-01-01T09:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true })
  startedAt?: Date;
  /**
   * @description Optional: Timestamp when the work for this entry ended.
   * @example "2024-01-01T17:00:00Z"
   */
  @Column({ type: "timestamp with time zone", nullable: true }) endedAt?: Date;

  /**
   * @description The duration of the entry in minutes.
   * @example 480
   */
  @Column("int") durationMin!: number; // store computed duration for fast totals
  /**
   * @description The date of the timesheet entry in ISO date format (YYYY-MM-DD).
   * @example "2024-01-01"
   */
  @Column("date") day!: string; // denormalized day for quick filtering
  /**
   * @description Optional: Any notes or comments for this specific entry.
   * @example "Worked on feature X"
   */
  @Column({ type: "text", nullable: true }) note?: string;
}
```

### Audit & Logging Tables

```typescript
// App.API/Entities/Timesheets/TimesheetHistory.ts
import { Entity, Column, ManyToOne, Index, JoinColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";

/**
 * @description Interface for a string-to-string dictionary, used for metadata and diffs.
 */
export interface IStringToStringDictionary {
  [key: string]: string;
}

/**
 * @description Records historical events related to timesheet entities.
 */
@Entity("timesheet_history")
@Index(["companyId", "userId"])
@Index(["companyId", "targetType", "targetId"])
export class TimesheetHistory extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this history record belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;

  /**
   * @description The company associated with this history record.
   */
  @ManyToOne(() => Company, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description The unique identifier of the user associated with the timesheet entity that this history record pertains to.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column("uuid") userId!: string; // owner of timesheet/entry

  /**
   * @description The type of the target entity that the history record refers to.
   * @example "Timesheet"
   */
  @Column({ type: "varchar", length: 32 }) targetType!:
    | "Timesheet"
    | "TimesheetEntry"
    | "TimesheetApproval"
    | "ActionCode";

  /**
   * @description The unique identifier of the target entity.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column("uuid") targetId!: string;

  /**
   * @description The action that was performed on the target entity.
   * @example "created"
   */
  @Column({ type: "varchar", length: 32 }) action!:
    | "created"
    | "updated"
    | "submitted"
    | "approved"
    | "rejected"
    | "deleted";

  /**
   * @description Optional: The unique identifier of the user who performed the action, if different from `userId`.
   * @example "a1c2t3o4-r5u6s7e8-9012-3456-7890abcdef"
   */
  @Column("uuid", { nullable: true }) actorUserId?: string;

  /**
   * @description Optional: A reason or comment for the action.
   * @example "Initial creation"
   */
  @Column({ type: "text", nullable: true }) reason?: string;
  /**
   * @description Optional: A JSON object representing the difference in state before and after the action.
   * @example { "status": "DRAFT", "newStatus": "SUBMITTED" }
   */
  @Column({ type: "jsonb", nullable: true }) diff?: IStringToStringDictionary;
  /**
   * @description Optional: Additional metadata related to the action.
   * @example { "ipAddress": "192.168.1.1" }
   */
  @Column({ type: "jsonb", nullable: true })
  metadata?: IStringToStringDictionary;

  /**
   * @description The timestamp when the action occurred.
   * @example "2024-01-01T10:00:00Z"
   */
  @Column({ type: "timestamp with time zone", default: () => "now()" })
For detailed entity definitions and their relationships, refer to the [[DATABASE.md#Schema Design]] document.

For a detailed breakdown of the Timesheet History module, including its entity definition and API routes, refer to [[Database/timesheet-history.md]].
```

## TypeORM Configuration

### Entity Definition

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Session } from './Session';
import { ApiKey } from './ApiKey';
import { CompanyMember } from './CompanyMember';
import { Company } from './Company';
import { Task } from './Task';
import { AuditLog } from './AuditLog';
import { AccessLog } from './AccessLog';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  SYSTEM = 'SYSTEM',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => Session, session => session.user)
  sessions!: Session[];

  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys!: ApiKey[];

  @OneToMany(() => CompanyMember, member => member.user)
  CompanyMembers!: CompanyMember[];

  @OneToMany(() => Company, Company => Company.owner)
  ownedCompanys!: Company[];

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks!: Task[];

  @OneToMany(() => AuditLog, log => log.user)
  auditLogs!: AuditLog[];

  @OneToMany(() => AccessLog, log => log.user)
  accessLogs!: AccessLog[];

  // ... other relations as needed
}

// ... Additional entities
```

### Data Source Configuration

```typescript
// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Company } from './entities/Company';
// ... import other entities

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // Never use synchronize in production
  logging: ['error', 'warn'],
  entities: [User, Company /* ... other entities */],
  migrations: [],
  subscribers: [],
});

// Initialize data source
export const initializeDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  }
};
```

## Migration Strategy

### Migration Workflow

TypeORM migrations are managed via the `typeorm` CLI. The following commands are used in the development workflow:

```bash
# Generate a new migration file based on entity changes
yarn typeorm migration:generate ./src/Migrations/MyNewMigration

# Apply all pending migrations
yarn typeorm migration:run

# Revert the last applied migration
yarn typeorm migration:revert

# Show the status of migrations
yarn typeorm migration:show

# Seed development data (if applicable)
yarn db:seed
```

### Migration Best Practices

1. **Atomic Migrations**: Each migration should be atomic
2. **Backward Compatibility**: Avoid breaking changes in migrations
3. **Data Migrations**: Separate schema and data migrations
4. **Rollback Strategy**: Always provide rollback migrations
5. **Testing**: Test migrations on production-like data

### Migration Example

TypeORM migrations are TypeScript files that define `up` and `down` methods to apply and revert database changes. They are generated using the `yarn typeorm migration:generate` command.

```typescript
// App.API/Migrations/1760310538461-InitialDatabase.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class InitialDatabase1760310538461 implements MigrationInterface {
  name = "InitialDatabase1760310538461";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "companies",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "timezone",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp with time zone",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp with time zone",
            default: "now()",
          },
          {
            name: "deletedAt",
            type: "timestamp with time zone",
            isNullable: true,
          },
          {
            name: "version",
            type: "int",
            default: "1",
          },
          {
            name: "createdByUserId",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "updatedByUserId",
            type: "uuid",
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "companies",
      new TableIndex({
        name: "IDX_COMPANY_NAME_UNIQUE",
        columnNames: ["name"],
        isUnique: true,
      }),
    );

    // ... other table creations and indices
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("companies", "IDX_COMPANY_NAME_UNIQUE");
    await queryRunner.dropTable("companies");
    // ... other table drops
  }
}
```

### Migration Scripts

```typescript
// scripts/migrate.ts
import { AppDataSource } from '../src/data-source';
import { execSync } from 'child_process';

async function migrate() {
  try {
    console.log('Running database migrations...');
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

migrate();
```

## Indexing Strategy

Indexes are crucial for database performance. In TypeORM, indexes can be defined directly on entities using the `@Index()` decorator, or programmatically within migration files for more complex scenarios.

### Entity-level Indexes

Here are examples of how indexes are defined on our TypeORM entities:

```typescript
// Example: User Entity Indexes
@Entity("users")
@Index(["companyId", "id"])
@Index(["companyId", "email"], { unique: true })
@Index(["companyId", "roleId"])
@Index(["companyId", "statusId"])
export default class User extends BaseEntity {
  // ... entity properties
}
```

```typescript
// Example: Company Entity Indexes
@Entity("companies")
@Index(["id"])
@Index(["name"], { unique: true })
export class Company extends BaseEntity {
  // ... entity properties
}
```

```typescript
// Example: Team Entity Indexes
@Entity("teams")
@Index(["companyId", "id", "name"], { unique: true })
export class Team extends BaseEntity {
  // ... entity properties
}
```

```typescript
// Example: Timesheet Entity Indexes
@Entity("timesheets")
@Index(["companyId", "userId", "periodStart", "periodEnd"], { unique: true })
@Index(["companyId", "status"])
export class Timesheet extends BaseEntity {
  // ... entity properties
}
```

```typescript
// Example: TimesheetEntry Entity Indexes
@Entity("timesheet_entries")
@Check(`"durationMin" BETWEEN 0 AND 1440`)
@Index(["companyId", "userId", "day"])
@Index(["companyId", "timesheetId"])
export class TimesheetEntry extends BaseEntity {
  // ... entity properties
}
```

```typescript
// Example: TimesheetHistory Entity Indexes
@Entity("timesheet_history")
@Index(["companyId", "userId"])
@Index(["companyId", "targetType", "targetId"])
export class TimesheetHistory extends BaseEntity {
  // ... entity properties
}
```

### Migration-level Indexes

For more complex indexes, such as partial indexes or those requiring specific SQL functions, they can be defined directly within migration files using `queryRunner.createIndex()`:

```typescript
// Example from a migration file
import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddUserEmailIndex123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USER_EMAIL_ACTIVE",
        columnNames: ["email"],
        isUnique: true,
        where: "\"deletedAt\" IS NULL", // Partial index example
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "IDX_USER_EMAIL_ACTIVE");
  }
}
```

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ncy8_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U postgres -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/ncy8_${DATE}.dump"

# Backup verification
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ncy8_${DATE}.dump"
  
  # Log backup in database
  psql -h localhost -U postgres -d $DB_NAME -c "
    INSERT INTO \"BackupSnapshot\" (path, size, verified, created_at)
    VALUES ('$BACKUP_DIR/ncy8_${DATE}.dump', 
            $(stat -c%s "$BACKUP_DIR/ncy8_${DATE}.dump"), 
            true, 
            NOW());
  "
else
  echo "Backup failed!"
  exit 1
fi

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "ncy8_*.dump" -mtime +30 -delete
```

### Point-in-Time Recovery (PITR)

```bash
# PITR Configuration
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
max_wal_senders = 3
wal_keep_size = 1GB

# Recovery script
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1
TARGET_TIME=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 <backup_file> <target_time>"
  echo "Example: $0 ncy8_20240115_120000.dump '2024-01-15 12:30:00'"
  exit 1
fi

# Stop PostgreSQL
systemctl stop postgresql

# Restore from backup
pg_restore -h localhost -U postgres -d ncy8_production -c $BACKUP_FILE

# Configure PITR
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '$TARGET_TIME'
EOF

# Start PostgreSQL
systemctl start postgresql
```

## Data Seeding

Data seeding is essential for populating the database with initial data for development, testing, and sometimes production. We use TypeORM's seeding capabilities.

### Development Seeds

Our project includes several seed files located in `App.API/Seeds/` to populate the database with essential data. These seeds are typically run after migrations to ensure a functional development environment.

Example of a seed file (`App.API/Seeds/01-seed-user-statuses.ts`):

```typescript
import { DataSource } from "typeorm";
import { UserStatus } from "../Entities/Users/UserStatus";
import { BaseSeed } from "./BaseSeed";

export class SeedUserStatuses1760310538461 extends BaseSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(UserStatus);

    const statuses = [
      { code: "ACTIVE", name: "Active", canLogin: true, isTerminal: false },
      { code: "INVITED", name: "Invited", canLogin: false, isTerminal: false },
      { code: "SUSPENDED", name: "Suspended", canLogin: false, isTerminal: false },
      { code: "TERMINATED", name: "Terminated", canLogin: false, isTerminal: true },
    ];

    for (const statusData of statuses) {
      const existing = await repository.findOneBy({ code: statusData.code });
      if (!existing) {
        await repository.save(repository.create(statusData));
      }
    }
  }
}
```

To run seeds, you would typically have a script or command configured in `package.json`:

```bash
# Example command to run seeds
yarn db:seed
```

## Performance Monitoring

### Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Query performance analysis
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Database Metrics

```typescript
// Database monitoring
import { prometheus } from 'prom-client';
import { AppDataSource } from '../src/data-source';

const dbConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

const queryDuration = new prometheus.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['query_type'],
});

// Monitor connection pool
setInterval(async () => {
  if (AppDataSource.isInitialized) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const result = await queryRunner.query(
        `SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'`
      );
      dbConnections.set(Number(result[0].active_connections));
    } finally {
      await queryRunner.release();
    }
  }
}, 5000);
```

## GDPR Compliance

Ensuring GDPR compliance is a critical aspect of data management. Our database strategy supports data retention policies and user data anonymization.

### Data Retention

Data retention policies are enforced at the database level, often through soft deletes and scheduled cleanup processes. For example, soft-deleted user data might be permanently removed after a defined period.

```sql
-- Example: Data retention policy for soft-deleted users (conceptual SQL)
-- This policy would typically be enforced by a background job or database trigger
DELETE FROM "users" WHERE "deletedAt" IS NOT NULL AND "deletedAt" < NOW() - INTERVAL '7 years';
```

### User Data Anonymization

For privacy reasons, user data can be anonymized instead of being permanently deleted. This process replaces sensitive personal information with non-identifiable data.

```typescript
// App.API/Services/Users/AnonymizationService.ts (simplified example)
import { Service } from "typedi";
import { UserRepository } from "../../Repositories/Users/UserRepository";
import ActiveSession from "../../Entities/Users/ActiveSessions";
import { NotFoundError } from "../../Errors/HttpErrors";
import { Repository } from "typeorm";

@Service()
export class AnonymizationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activeSessionRepository: Repository<ActiveSession>,
  ) {}

  public async anonymizeUserData(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.companyId !== companyId) {
      throw new NotFoundError("User not found");
    }

    // Anonymize user's personal information
    user.firstName = "Deleted";
    user.lastName = "User";
    user.email = `deleted-${user.id}@gogotime.com`;
    user.phoneNumber = undefined;
    user.passwordHash = ""; // Invalidate password
    user.isAnonymized = true;

    await this.userRepository.update(user.id, user);

    // Hard delete related sensitive data (e.g., active sessions)
    await this.activeSessionRepository.delete({ userId: user.id });
  }
}
```

---

*This database strategy ensures data integrity, performance, and compliance while providing a solid foundation for the NCY_8 platform.*
