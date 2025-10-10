
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Team, TeamMember } from './Team';
import { ActionCode } from '../Timesheet/ActionCode';
import { TimesheetEntry } from '../Timesheet/TimesheetEntry';
import { TimesheetHistory } from '../Timesheet/TimesheetHistory';

@Entity()
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  @OneToMany(() => Team, (team) => team.organization)
  teams!: Team[];

  @OneToMany(() => ActionCode, (actionCode) => actionCode.organization)
  actionCodes!: ActionCode[];

  @OneToMany(() => TimesheetEntry, (entry) => entry.organization)
  timesheetEntries!: TimesheetEntry[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.organization)
  teamMembers!: TeamMember[];

  @OneToMany(() => TimesheetHistory, (timesheetHistory) => timesheetHistory.organization)
  timesheetHistory!: TimesheetHistory[];
}
