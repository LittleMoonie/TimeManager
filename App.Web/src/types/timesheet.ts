export type ActionCodeId = string;
export type ISODate = string;
export type ISO8601 = string;

export type WorkMode = 'Office' | 'Homeworking';

export interface ActionCode {
  id: ActionCodeId;
  label: string;
  project?: string;
  color?: string;
}

export interface LocationInfo {
  mode: WorkMode;
  country: string;
}

export interface TimeInterval {
  start: string;
  end: string;
}

export interface CellEntry {
  minutes: number;
  intervals?: TimeInterval[];
  note?: string;
  location: LocationInfo;
  sent?: boolean;
  deficitReason?: string;
}

export type DayMap = Record<ISODate, CellEntry>;
export type WeekMap = Record<ActionCodeId, DayMap>;

export type TimesheetStatus = 'draft' | 'sent' | 'attention-required' | 'approved' | 'rejected';

export interface Timesheet {
  id: string;
  userId: string;
  weekStartISO: ISODate;
  status: TimesheetStatus;
  entries: WeekMap;
  weekTotal: number;
  submittedAt?: ISO8601;
  timezone: string;
  weeklyMin: number;
  dailyMin: number;
  missingReasons?: ISODate[];
  weekendOverrides?: ISODate[];
}
