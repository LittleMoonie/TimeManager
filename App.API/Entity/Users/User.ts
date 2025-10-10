
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Organization } from '../Company/Company';
// import { TeamMember } from '../Company/Team'; // Removed import
// import { UserStatus } from '../Enums/UserStatus'; // Old enum import
import { TimesheetHistory } from '../Timesheet/TimesheetHistory';
import { Role } from './Role';
import { UserStatus } from './UserStatus'; // New entity import

@Entity()
@Index(['orgId', 'id'])
export default class User extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @Column({ type: 'uuid', nullable: false })
  roleId!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin?: Date;

  @ManyToOne(() => UserStatus, (userStatus) => userStatus.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status!: UserStatus;

  @Column({ type: 'uuid', nullable: false })
  statusId!: string;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  // @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  // teamMembership!: TeamMember[];

  @OneToMany(() => TimesheetHistory, (timesheetHistory) => timesheetHistory.user)
  timesheetHistory!: TimesheetHistory[];
}

