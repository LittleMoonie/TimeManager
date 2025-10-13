/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ActionCode } from './ActionCode';
import type { CompanySettings } from './CompanySettings';
import type { Team } from './Team';
import type { TeamMember } from './TeamMember';
import type { TimesheetEntry } from './TimesheetEntry';
import type { TimesheetHistory } from './TimesheetHistory';
import type { User } from './User';
export type Company = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  name: string;
  timezone?: string;
  users: Array<User>;
  teams: Array<Team>;
  actionCodes: Array<ActionCode>;
  timesheetEntries: Array<TimesheetEntry>;
  teamMembers: Array<TeamMember>;
  timesheetHistory: Array<TimesheetHistory>;
  companySettings: CompanySettings;
};
