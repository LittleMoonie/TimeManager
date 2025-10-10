export interface TimesheetEntryDto {
  actionCodeId: string;
  workMode: 'office' | 'remote' | 'hybrid';
  country: string;
  startedAt?: Date;
  endedAt?: Date;
  durationMin: number;
  note?: string;
  day: Date;
}

export interface TimesheetHistorySummary {
  weekStartISO: string;
  status: string;
  weekTotal: number;
  submittedAt?: Date;
}
