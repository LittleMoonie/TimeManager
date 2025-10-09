import { addDays, formatISO, isWeekend, parseISO } from 'date-fns';
import { delay } from './mockData';
import type {
  ActionCode,
  ActionCodeId,
  CellEntry,
  ISODate,
  Timesheet,
  TimesheetStatus,
  WeekMap,
} from '@/types';

const DEFAULT_DAILY_MIN = 480;
const DEFAULT_WEEKLY_MIN = 2400;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const actionCodes: ActionCode[] = [
  { id: 'MANAGEMENT-5001', label: 'Meetings', project: 'Leadership', color: '#1565c0' },
  { id: 'CHECK-0001', label: 'Emails', project: 'Operations', color: '#6a1b9a' },
  { id: 'DEV-2103', label: 'Feature work', project: 'Product', color: '#2e7d32' },
  { id: 'QA-1120', label: 'Testing', project: 'Quality', color: '#ed6c02' },
];

type TimesheetStore = {
  timesheetsByWeek: Map<ISODate, Timesheet>;
};

const store: TimesheetStore = {
  timesheetsByWeek: new Map(),
};

const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const createEmptyWeek = (weekStartISO: ISODate): Timesheet => {
  return {
    id: `ts-${weekStartISO}`,
    userId: '1',
    weekStartISO,
    status: 'draft',
    entries: {},
    weekTotal: 0,
    timezone: getTimezone(),
    weeklyMin: DEFAULT_WEEKLY_MIN,
    dailyMin: DEFAULT_DAILY_MIN,
    missingReasons: [],
    weekendOverrides: [],
  };
};

const computeDayTotal = (entries: WeekMap, dateISO: ISODate) =>
  Object.values(entries).reduce((total, dayMap) => {
    const cell = dayMap[dateISO];
    return total + (cell?.minutes ?? 0);
  }, 0);

const computeWeekTotal = (entries: WeekMap) =>
  Object.values(entries).reduce((weekTotal, dayMap) => {
    return (
      weekTotal +
      Object.values(dayMap).reduce((daySum, cell) => daySum + (cell?.minutes ?? 0), 0)
    );
  }, 0);

const ensureEntry = (
  timesheet: Timesheet,
  code: ActionCodeId,
  dateISO: ISODate,
  defaults?: Partial<CellEntry>,
) => {
  if (!timesheet.entries[code]) {
    timesheet.entries[code] = {};
  }
  if (!timesheet.entries[code][dateISO]) {
    timesheet.entries[code][dateISO] = {
      minutes: 0,
      location: {
        mode: 'Office',
        country: 'US',
      },
      ...defaults,
    };
  } else if (defaults) {
    timesheet.entries[code][dateISO] = {
      ...timesheet.entries[code][dateISO],
      ...defaults,
    };
  }
};

export const timesheetApi = {
  async getActionCodes(): Promise<ActionCode[]> {
    await delay(180);
    return actionCodes;
  },

  async getTimesheet(weekStartISO: ISODate): Promise<Timesheet> {
    await delay(220);
    const existing = store.timesheetsByWeek.get(weekStartISO);
    if (existing) {
      if (!existing.weekendOverrides) {
        existing.weekendOverrides = [];
        store.timesheetsByWeek.set(weekStartISO, existing);
      }
      return clone(existing);
    }

    const newSheet = createEmptyWeek(weekStartISO);
    store.timesheetsByWeek.set(weekStartISO, newSheet);
    return clone(newSheet);
  },

  async patchTimesheet(timesheetId: string, payload: Partial<Timesheet>): Promise<Timesheet> {
    await delay(180);

    const weekEntry = Array.from(store.timesheetsByWeek.values()).find(({ id }) => id === timesheetId);
    if (!weekEntry) {
      throw new Error('Timesheet not found');
    }

    const next: Timesheet = {
      ...weekEntry,
      ...payload,
    };

    if (!next.weekendOverrides) {
      next.weekendOverrides = weekEntry.weekendOverrides ?? [];
    }

    next.weekTotal = computeWeekTotal(next.entries);

    store.timesheetsByWeek.set(next.weekStartISO, clone(next));

    return clone(next);
  },

  async upsertCellEntry(timesheetId: string, code: ActionCodeId, dateISO: ISODate, entry: CellEntry) {
    await delay(160);
    const weekEntry = Array.from(store.timesheetsByWeek.values()).find(({ id }) => id === timesheetId);

    if (!weekEntry) {
      throw new Error('Timesheet not found');
    }

    const weekendBlocked =
      isWeekend(parseISO(dateISO)) && !(weekEntry.weekendOverrides ?? []).includes(dateISO);
    if (weekendBlocked) {
      throw new Error('Weekend work requires approval from a manager.');
    }

    ensureEntry(weekEntry, code, dateISO, entry);
    weekEntry.entries[code][dateISO] = {
      ...weekEntry.entries[code][dateISO],
      ...entry,
      minutes: entry.minutes,
    };

    weekEntry.weekTotal = computeWeekTotal(weekEntry.entries);

    store.timesheetsByWeek.set(weekEntry.weekStartISO, clone(weekEntry));

    return clone(weekEntry);
  },

  async removeCell(timesheetId: string, code: ActionCodeId, dateISO: ISODate) {
    await delay(140);
    const weekEntry = Array.from(store.timesheetsByWeek.values()).find(({ id }) => id === timesheetId);
    if (!weekEntry) {
      throw new Error('Timesheet not found');
    }

    if (weekEntry.entries[code]) {
      delete weekEntry.entries[code][dateISO];
      if (Object.keys(weekEntry.entries[code]).length === 0) {
        delete weekEntry.entries[code];
      }
    }

    weekEntry.weekTotal = computeWeekTotal(weekEntry.entries);
    store.timesheetsByWeek.set(weekEntry.weekStartISO, clone(weekEntry));

    return clone(weekEntry);
  },

  async removeActionCode(timesheetId: string, code: ActionCodeId) {
    await delay(140);
    const weekEntry = Array.from(store.timesheetsByWeek.values()).find(({ id }) => id === timesheetId);
    if (!weekEntry) {
      throw new Error('Timesheet not found');
    }

    if (weekEntry.entries[code]) {
      delete weekEntry.entries[code];
    }

    weekEntry.weekTotal = computeWeekTotal(weekEntry.entries);
    store.timesheetsByWeek.set(weekEntry.weekStartISO, clone(weekEntry));

    return clone(weekEntry);
  },

  async sendDay({
    timesheetId,
    dateISO,
    deficitReason,
    locationAudit: _locationAudit,
  }: {
    timesheetId: string;
    dateISO: ISODate;
    deficitReason?: string;
    locationAudit?: Array<{ mode: string; country: string }>;
  }) {
    await delay(220);
    const timesheet = Array.from(store.timesheetsByWeek.values()).find(({ id }) => id === timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    const weekendBlocked =
      isWeekend(parseISO(dateISO)) && !(timesheet.weekendOverrides ?? []).includes(dateISO);
    if (weekendBlocked) {
      throw new Error('Weekend work requires approval from a manager.');
    }

    Object.entries(timesheet.entries).forEach(([_, dayMap]) => {
      if (dayMap[dateISO]) {
        dayMap[dateISO] = {
          ...dayMap[dateISO],
          sent: true,
          deficitReason: deficitReason ?? dayMap[dateISO].deficitReason,
        };
      }
    });

    const missingReasons = new Set(timesheet.missingReasons ?? []);
    if (deficitReason) {
      missingReasons.delete(dateISO);
    }

    timesheet.missingReasons = Array.from(missingReasons);
    timesheet.weekTotal = computeWeekTotal(timesheet.entries);

    if (timesheet.weekTotal >= timesheet.weeklyMin) {
      const weekSent = Object.values(timesheet.entries).every((dayMap) =>
        Object.values(dayMap).every((entry) => entry.sent)
      );

      if (weekSent) {
        timesheet.status = 'sent';
        timesheet.submittedAt = new Date().toISOString();
      }
    }

    store.timesheetsByWeek.set(timesheet.weekStartISO, clone(timesheet));

    return clone(timesheet);
  },

  async autoSendWeek({
    timesheetId,
    weekStartISO,
  }: {
    timesheetId: string;
    weekStartISO: ISODate;
  }) {
    await delay(260);
    const timesheet = store.timesheetsByWeek.get(weekStartISO);
    if (!timesheet || timesheet.id !== timesheetId) {
      throw new Error('Timesheet not found');
    }

    const weekStart = parseISO(weekStartISO);

    const missing: ISODate[] = [];

    for (let i = 0; i < 7; i++) {
      const dayISO = formatISO(addDays(weekStart, i), { representation: 'date' });
      const dayTotal = computeDayTotal(timesheet.entries, dayISO);
      const hasEntries = dayTotal > 0;

      if (!hasEntries) continue;

      const allCells = Object.values(timesheet.entries)
        .map((dayMap) => dayMap[dayISO])
        .filter(Boolean) as CellEntry[];

      const sent = allCells.every((cell) => cell.sent);
      if (sent) continue;

      const hasDeficit = dayTotal < timesheet.dailyMin;
      const hasReasons = allCells.every((cell) => (cell.sent ? Boolean(cell.deficitReason) : true));

      if (hasDeficit && !hasReasons) {
        missing.push(dayISO);
      } else {
        allCells.forEach((cell) => {
          cell.sent = true;
        });
      }
    }

    timesheet.weekTotal = computeWeekTotal(timesheet.entries);

    if (missing.length) {
      timesheet.status = 'attention-required';
      timesheet.missingReasons = missing;
    } else {
      timesheet.status = 'sent';
      timesheet.submittedAt = new Date().toISOString();
      timesheet.missingReasons = [];
    }

    store.timesheetsByWeek.set(weekStartISO, clone(timesheet));

    return {
      status: timesheet.status,
      submittedAt: timesheet.submittedAt,
      missingReasons: timesheet.missingReasons,
    } as { status: TimesheetStatus; submittedAt?: string; missingReasons?: ISODate[] };
  },

  async listTimesheets() {
    await delay(180);
    return Array.from(store.timesheetsByWeek.values())
      .sort((a, b) => (a.weekStartISO < b.weekStartISO ? 1 : -1))
      .map((item) => clone(item));
  },
};

export const timesheetUtils = {
  computeDayTotal,
  computeWeekTotal,
  ensureEntry,
};
