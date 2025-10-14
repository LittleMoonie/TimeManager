/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ApproverPolicy } from './ApproverPolicy';
import type { Company } from './Company';
import type { Record_string_number_Array_ } from './Record_string_number_Array_';
export type CompanySettings = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  companyId: string;
  company: Company;
  timezone: string;
  workWeek: Record_string_number_Array_;
  holidayCalendar?: string;
  timesheetApproverPolicy: ApproverPolicy;
  allowedEmailDomains?: Array<string>;
  requireCompanyEmail: boolean;
};
