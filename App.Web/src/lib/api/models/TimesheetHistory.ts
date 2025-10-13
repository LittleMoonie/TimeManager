/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from './Company';
import type { IStringToStringDictionary } from './IStringToStringDictionary';
export type TimesheetHistory = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  userId: string;
  targetType: TimesheetHistory.targetType;
  targetId: string;
  action: TimesheetHistory.action;
  actorUserId?: string;
  reason?: string;
  diff?: IStringToStringDictionary;
  metadata?: IStringToStringDictionary;
  occurredAt: string;
};
export namespace TimesheetHistory {
  export enum targetType {
    TIMESHEET = 'Timesheet',
    TIMESHEET_ENTRY = 'TimesheetEntry',
    TIMESHEET_APPROVAL = 'TimesheetApproval',
    ACTION_CODE = 'ActionCode',
  }
  export enum action {
    CREATED = 'created',
    UPDATED = 'updated',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted',
  }
}
