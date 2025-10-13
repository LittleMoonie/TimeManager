import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Team } from './Team';
import { TeamMember } from './TeamMember';
import { ActionCode } from '../Timesheets/ActionCode';
import { TimesheetEntry } from '../Timesheets/TimesheetEntry';
import { TimesheetHistory } from '../Timesheets/TimesheetHistory';
import { CompanySettings } from './CompanySettings';

/**
 * @description Represents a company in the system.
 */
@Entity('companies')
@Index(['id'])
@Index(['name'], { unique: true })
export class Company extends BaseEntity {
  /**
   * @description The name of the company.
   * @example "Acme Corp"
   */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /**
   * @description The timezone of the company (e.g., "America/New_York").
   * @example "America/New_York"
   */
  @Column({ type: 'varchar', length: 255, nullable: true }) timezone?: string;

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
