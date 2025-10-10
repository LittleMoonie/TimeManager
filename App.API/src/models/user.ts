
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Organization } from './organization';
import { TeamMember } from './team';
import { UserStatus } from './enums/UserStatus';
import { TimesheetHistory } from './timesheetHistory';

@Entity()
@Index(['orgId', 'id'])
export default class User extends BaseEntity {
  @Column({ type: 'uuid' })
  orgId!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  role!: string;

  // Enum Status
  @Column({ type: 'enum', enum: UserStatus, nullable: false })
  status!: UserStatus;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orgId' })
  organization!: Organization;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMembership!: TeamMember[];

  @OneToMany(() => TimesheetHistory, (timesheetHistory) => timesheetHistory.user)
  timesheetHistory!: TimesheetHistory[];
}

