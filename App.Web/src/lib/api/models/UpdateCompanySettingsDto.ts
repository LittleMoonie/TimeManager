/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproverPolicy } from './ApproverPolicy';
import type { Record_string_number_Array_ } from './Record_string_number_Array_';
export type UpdateCompanySettingsDto = {
  timezone?: string;
  workWeek?: Record_string_number_Array_;
  holidayCalendar?: string;
  timesheetApproverPolicy?: ApproverPolicy;
  allowedEmailDomains?: Array<string>;
  requireCompanyEmail?: boolean;
};
