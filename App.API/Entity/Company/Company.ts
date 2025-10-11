import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Team, TeamMember } from './Team';
import { ActionCode } from '../Timesheets/ActionCode';
import { TimesheetEntry } from '../Timesheets/TimesheetEntry';
import { TimesheetHistory } from '../Timesheets/TimesheetHistory';

@Entity('companies')
@Index(['id'])
@Index(['name'], { unique: true })
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) timezone?: string;

  @OneToMany(() => User, (user) => user.company) users!: User[];
  @OneToMany(() => Team, (team) => team.company) teams!: Team[];
  @OneToMany(() => ActionCode, (a) => a.company) actionCodes!: ActionCode[];
  @OneToMany(() => TimesheetEntry, (e) => e.company) timesheetEntries!: TimesheetEntry[];
  @OneToMany(() => TeamMember, (tm) => tm.company) teamMembers!: TeamMember[];
  @OneToMany(() => TimesheetHistory, (th) => th.company) timesheetHistory!: TimesheetHistory[];
}
