import type { WeeklyRowState } from '@/hooks/useTimesheet';
import {
  ActionCode,
  ActionCodeBillableDefault,
  ActionCodeLocationPolicy,
  TimesheetRowBillableTag,
  TimesheetRowLocation,
  TimesheetRowStatus,
} from '@/lib/api';

export const resolveDefaultBillable = (timeCode: ActionCode): TimesheetRowBillableTag => {
  switch (timeCode.billableDefault) {
    case ActionCodeBillableDefault.BILLABLE:
      return TimesheetRowBillableTag.BILLABLE;
    case ActionCodeBillableDefault.NON_BILLABLE:
      return TimesheetRowBillableTag.NON_BILLABLE;
    case ActionCodeBillableDefault.AUTO:
    default:
      return timeCode.type === 'billable'
        ? TimesheetRowBillableTag.BILLABLE
        : TimesheetRowBillableTag.NON_BILLABLE;
  }
};

export const resolveDefaultLocation = (
  timeCode: ActionCode | null | undefined,
  fallback: TimesheetRowLocation,
): TimesheetRowLocation => {
  if (!timeCode) return fallback;
  switch (timeCode.locationPolicy) {
    case ActionCodeLocationPolicy.OFFICE_ONLY:
      return TimesheetRowLocation.OFFICE;
    case ActionCodeLocationPolicy.HOMEWORKING_ONLY:
      return TimesheetRowLocation.HOMEWORKING;
    default:
      return fallback;
  }
};

export const buildTimesheetRow = (
  timeCode: ActionCode,
  defaultCountry: string,
  defaultLocation: TimesheetRowLocation,
): WeeklyRowState => {
  let location = resolveDefaultLocation(timeCode, defaultLocation);
  const isSickLeave = timeCode.code?.toUpperCase() === 'SICK';
  if (isSickLeave) {
    location = TimesheetRowLocation.HOMEWORKING;
  }

  return {
    clientId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${timeCode.id}-${Math.random().toString(16).slice(2)}`,
    activityLabel: timeCode.name ?? timeCode.code,
    timeCodeId: timeCode.id,
    timeCodeName: timeCode.name,
    timeCodeCode: timeCode.code,
    billable: resolveDefaultBillable(timeCode),
    location,
    countryCode: defaultCountry,
    employeeCountryCode: location === TimesheetRowLocation.OFFICE ? null : defaultCountry,
    status: TimesheetRowStatus.DRAFT,
    locked: false,
    entries: {},
  };
};
