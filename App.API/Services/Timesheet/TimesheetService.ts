import { plainToInstance, type ClassTransformOptions } from 'class-transformer';
import { validate, type ValidatorOptions } from 'class-validator';
import { addDays, formatISO } from 'date-fns';
import { Inject, Service } from 'typedi';

import {
  CreateTimesheetDto,
  CreateTimesheetEntryDto,
  UpdateTimesheetDto,
} from '../../Dtos/Timesheet/TimesheetDto';
import {
  TimesheetWeekResponseDto,
  TimesheetWeekRowEntryDto,
  TimesheetWeekRowDto,
  TimesheetWeekRowRejectionDto,
  TimesheetWeekUpsertDto,
  TimesheetWeekSubmitDto,
  TimesheetWeekSettingsDto,
  TimesheetWeekRejectionDto,
} from '../../Dtos/Timesheet/TimesheetWeekDto';
import {
  ActionCode,
  ActionCodeBillableDefault,
  ActionCodeType,
} from '../../Entities/Timesheets/ActionCode';
import { Timesheet, TimesheetStatus } from '../../Entities/Timesheets/Timesheet';
import { TimesheetEntryStatus, WorkMode } from '../../Entities/Timesheets/TimesheetEntry';
import {
  TimesheetRow,
  TimesheetRowBillableTag,
  TimesheetRowLocation,
  TimesheetRowStatus,
} from '../../Entities/Timesheets/TimesheetRow';
import { NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import { CompanySettingsRepository } from '../../Repositories/Companies/CompanySettingsRepository';
import { TimesheetEntryRepository } from '../../Repositories/Timesheets/TimesheetEntryRepository';
import { TimesheetHistoryRepository } from '../../Repositories/Timesheets/TimesheetHistoryRepository';
import { TimesheetRepository } from '../../Repositories/Timesheets/TimesheetRepository';
import { TimesheetRowRepository } from '../../Repositories/Timesheets/TimesheetRowRepository';
import { UserRepository } from '../../Repositories/Users/UserRepository';

/**
 * @description Service layer for managing Timesheet entities. This service provides business logic
 * for timesheet operations, including creation, entry management, submission, approval, and rejection.
 * It also integrates with TimesheetHistoryRepository to record events.
 */
@Service()
export class TimesheetService {
  /**
   * @description Initializes the TimesheetService with necessary repositories.
   * @param timesheetRepository The repository for Timesheet entities.
   * @param timesheetEntryRepository The repository for TimesheetEntry entities.
   * @param historyRepository The repository for TimesheetHistory entities.
   */
  constructor(
    @Inject('TimesheetRepository') private readonly timesheetRepository: TimesheetRepository,
    @Inject('TimesheetEntryRepository')
    private readonly timesheetEntryRepository: TimesheetEntryRepository,
    @Inject('TimesheetHistoryRepository')
    private readonly historyRepository: TimesheetHistoryRepository,
    @Inject('TimesheetRowRepository')
    private readonly timesheetRowRepository: TimesheetRowRepository,
    @Inject('CompanySettingsRepository')
    private readonly companySettingsRepository: CompanySettingsRepository,
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  private async validateDto<T>(
    DtoType: new () => T,
    dto: unknown,
    transformOptions: ClassTransformOptions = { enableImplicitConversion: true },
    validatorOptions: ValidatorOptions = { forbidUnknownValues: false },
  ): Promise<T> {
    const instance = plainToInstance(DtoType, (dto ?? {}) as object, transformOptions);
    const errors = await validate(instance as object, validatorOptions);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }

    return instance;
  }

  private getWeekRange(isoWeekStart: string): { start: string; end: string } {
    const startDate = new Date(`${isoWeekStart}T00:00:00.000Z`);
    if (Number.isNaN(startDate.getTime())) {
      throw new UnprocessableEntityError('Invalid week start date. Expected format YYYY-MM-DD.');
    }
    const endDate = addDays(startDate, 6);
    const start = formatISO(startDate, { representation: 'date' });
    const end = formatISO(endDate, { representation: 'date' });
    return { start, end };
  }

  private toWeekSettings(settings?: {
    defaultCountryCode?: string | null;
    defaultLocation?: string;
    maxWeeklyMinutes?: number;
    officeCountryCodes?: string[] | null;
  }): TimesheetWeekSettingsDto {
    const defaultCountry = settings?.defaultCountryCode
      ? settings.defaultCountryCode.toUpperCase()
      : undefined;
    const configuredOfficeCodes =
      settings?.officeCountryCodes && settings.officeCountryCodes.length > 0
        ? settings.officeCountryCodes.map((code) => code.toUpperCase())
        : undefined;
    const officeList =
      configuredOfficeCodes && configuredOfficeCodes.length > 0
        ? configuredOfficeCodes
        : defaultCountry
          ? [defaultCountry]
          : undefined;

    return {
      defaultCountryCode: defaultCountry ?? undefined,
      defaultLocation: settings?.defaultLocation ?? TimesheetRowLocation.OFFICE,
      maxWeeklyMinutes: settings?.maxWeeklyMinutes ?? 2400,
      autoSubmitAt: '18:00',
      officeCountryCodes: officeList,
    };
  }

  private normaliseRowLocation(value?: string | null): TimesheetRowLocation {
    const normalised = (value ?? TimesheetRowLocation.OFFICE).toString().trim().toLowerCase();

    if (normalised === 'office') {
      return TimesheetRowLocation.OFFICE;
    }

    if (normalised === 'hybrid') {
      return TimesheetRowLocation.HYBRID;
    }

    if (normalised === 'homeworking' || normalised === 'remote') {
      return TimesheetRowLocation.HOMEWORKING;
    }

    return TimesheetRowLocation.OFFICE;
  }

  private mapWorkModeToLocation(workMode?: WorkMode | null): TimesheetRowLocation {
    switch (workMode) {
      case WorkMode.REMOTE:
        return TimesheetRowLocation.HOMEWORKING;
      case WorkMode.HYBRID:
        return TimesheetRowLocation.HYBRID;
      case WorkMode.OFFICE:
      default:
        return TimesheetRowLocation.OFFICE;
    }
  }

  private mapRowToDto(
    row: TimesheetRow,
    rejectionInfo?: TimesheetWeekRowRejectionDto,
  ): TimesheetWeekRowDto {
    const location = this.normaliseRowLocation(row.location);

    const billable = row.billable ?? TimesheetRowBillableTag.AUTO;
    const status = row.status ?? TimesheetRowStatus.DRAFT;
    const locked = row.locked ?? false;
    const employeeCountryCode =
      location === TimesheetRowLocation.OFFICE
        ? undefined
        : (row.employeeCountryCode ?? row.countryCode ?? undefined);

    return {
      id: row.id,
      activityLabel: row.activityLabel,
      timeCodeId: row.timeCodeId,
      billable,
      location,
      countryCode: row.countryCode,
      employeeCountryCode,
      status,
      locked,
      entries: row.entries
        ? row.entries
            .map((entry) => ({
              day: entry.day,
              minutes: entry.durationMin,
              note: entry.note ?? undefined,
            }))
            .sort((a, b) => a.day.localeCompare(b.day))
        : [],
      rejection: status === TimesheetRowStatus.REJECTED ? rejectionInfo : undefined,
    };
  }

  private normaliseEntries(entries: TimesheetWeekRowDto['entries']) {
    const map = new Map<string, { minutes: number; note?: string | null }>();
    for (const entry of entries ?? []) {
      const minutes = Math.max(0, Math.round(entry.minutes ?? 0));
      const note = entry.note?.trim();
      map.set(entry.day, { minutes, note: note?.length ? note : null });
    }
    return map;
  }

  private resolveBillableFromActionCode(actionCode?: ActionCode | null): TimesheetRowBillableTag {
    if (!actionCode) {
      return TimesheetRowBillableTag.AUTO;
    }

    switch (actionCode.billableDefault) {
      case ActionCodeBillableDefault.BILLABLE:
        return TimesheetRowBillableTag.BILLABLE;
      case ActionCodeBillableDefault.NON_BILLABLE:
        return TimesheetRowBillableTag.NON_BILLABLE;
      case ActionCodeBillableDefault.AUTO:
      default:
        return actionCode.type === ActionCodeType.NON_BILLABLE
          ? TimesheetRowBillableTag.NON_BILLABLE
          : TimesheetRowBillableTag.BILLABLE;
    }
  }

  private resolveRowStatusFromEntries(
    entries: Array<{ status?: TimesheetEntryStatus | null }>,
    parentStatus: TimesheetStatus,
  ): TimesheetRowStatus {
    const statuses = new Set(entries.map((entry) => entry.status));

    if (statuses.has(TimesheetEntryStatus.APPROVED) || parentStatus === TimesheetStatus.APPROVED) {
      return TimesheetRowStatus.APPROVED;
    }

    if (statuses.has(TimesheetEntryStatus.REJECTED)) {
      return TimesheetRowStatus.REJECTED;
    }

    if (
      statuses.has(TimesheetEntryStatus.PENDING_APPROVAL) ||
      parentStatus === TimesheetStatus.SUBMITTED
    ) {
      return TimesheetRowStatus.SUBMITTED;
    }

    return TimesheetRowStatus.DRAFT;
  }

  private mapLocationToWorkMode(location: TimesheetRowLocation): WorkMode {
    switch (location) {
      case TimesheetRowLocation.HOMEWORKING:
        return WorkMode.REMOTE;
      case TimesheetRowLocation.HYBRID:
        return WorkMode.HYBRID;
      case TimesheetRowLocation.OFFICE:
      default:
        return WorkMode.OFFICE;
    }
  }

  private async getTimesheetRejectionInfo(
    companyId: string,
    timesheet: Timesheet,
  ): Promise<TimesheetWeekRejectionDto | undefined> {
    if (timesheet.status !== TimesheetStatus.REJECTED) {
      return undefined;
    }

    const history = await this.historyRepository.findLatestForTimesheet(
      companyId,
      timesheet.id,
      'rejected',
    );

    if (!history) {
      return undefined;
    }

    let actorName: string | undefined;
    if (history.actorUserId) {
      const actor = await this.userRepository.findByIdInCompany(history.actorUserId, companyId);
      if (actor) {
        actorName = [actor.firstName, actor.lastName].filter(Boolean).join(' ').trim();
      }
    }

    return {
      reason: history.reason ?? undefined,
      actorId: history.actorUserId ?? undefined,
      actorName,
      occurredAt: history.occurredAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private async backfillRowsFromLegacyEntries(
    companyId: string,
    userId: string,
    timesheet: Timesheet,
    defaults?: {
      defaultCountryCode?: string | null;
      defaultLocation?: string | null;
      officeCountryCodes?: string[] | null;
    },
  ): Promise<void> {
    const legacyEntries = await this.timesheetEntryRepository.findAllForTimesheet(timesheet.id);
    if (legacyEntries.length === 0) {
      return;
    }

    const defaultCountry = defaults?.defaultCountryCode
      ? defaults.defaultCountryCode.toUpperCase()
      : undefined;
    const officeCountries = (defaults?.officeCountryCodes ?? [])
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toUpperCase());
    const fallbackCountry = defaultCountry ?? officeCountries[0] ?? 'US';
    const defaultLocation = this.normaliseRowLocation(
      defaults?.defaultLocation ?? TimesheetRowLocation.OFFICE,
    );

    type LegacyGroup = {
      actionCodeId: string;
      actionCode?: ActionCode;
      entries: typeof legacyEntries;
      workMode?: WorkMode | null;
      country?: string | null;
    };

    const grouped = new Map<string, LegacyGroup>();
    for (const entry of legacyEntries) {
      if (!entry.actionCodeId) continue;
      const key = `${entry.actionCodeId}-${entry.workMode ?? 'office'}-${entry.country ?? ''}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          actionCodeId: entry.actionCodeId,
          actionCode: entry.actionCode,
          entries: [entry],
          workMode: entry.workMode,
          country: entry.country,
        });
      } else {
        grouped.get(key)!.entries.push(entry);
      }
    }

    if (grouped.size === 0) {
      return;
    }

    let sortOrder = 0;

    for (const group of grouped.values()) {
      sortOrder += 1;
      const actionCode = group.actionCode;
      const location =
        group.workMode != null ? this.mapWorkModeToLocation(group.workMode) : defaultLocation;
      const countryCode = (group.country ?? defaultCountry ?? fallbackCountry).toUpperCase();
      const employeeCountryCode = location === TimesheetRowLocation.OFFICE ? null : countryCode;
      const rowStatus = this.resolveRowStatusFromEntries(group.entries, timesheet.status);
      const locked =
        rowStatus === TimesheetRowStatus.SUBMITTED || rowStatus === TimesheetRowStatus.APPROVED;

      const row = await this.timesheetRowRepository.create({
        companyId,
        userId,
        timesheetId: timesheet.id,
        activityLabel: actionCode?.name ?? actionCode?.code ?? 'Timesheet activity',
        timeCodeId: group.actionCodeId,
        billable: this.resolveBillableFromActionCode(actionCode),
        location,
        countryCode,
        employeeCountryCode,
        status: rowStatus,
        locked,
        sortOrder,
      });

      const byDay = new Map<
        string,
        { primary: (typeof legacyEntries)[number]; total: number; note?: string | null }
      >();
      const extras: string[] = [];

      for (const entry of group.entries) {
        const key = entry.day;
        if (!byDay.has(key)) {
          byDay.set(key, {
            primary: entry,
            total: entry.durationMin ?? 0,
            note: entry.note ?? null,
          });
        } else {
          const bucket = byDay.get(key)!;
          bucket.total += entry.durationMin ?? 0;
          if (!bucket.note && entry.note) {
            bucket.note = entry.note;
          }
          extras.push(entry.id);
        }
      }

      for (const bucket of byDay.values()) {
        await this.timesheetEntryRepository.update(bucket.primary.id, {
          timesheetRowId: row.id,
          durationMin: bucket.total,
          note: bucket.note ?? null,
          country: countryCode,
          workMode: this.mapLocationToWorkMode(location),
          status: bucket.primary.status ?? TimesheetEntryStatus.SAVED,
          statusUpdatedAt: bucket.primary.statusUpdatedAt ?? new Date(),
        });
      }

      for (const extraId of extras) {
        await this.timesheetEntryRepository.delete(extraId);
      }
    }
  }

  private async syncRowEntries(
    row: TimesheetRow,
    entries: Map<string, { minutes: number; note?: string | null }>,
    companyId: string,
    userId: string,
  ): Promise<void> {
    const existingEntries = row.entries ?? [];
    const existingByDay = new Map(existingEntries.map((entry) => [entry.day, entry]));

    for (const [day, payload] of entries.entries()) {
      const { minutes, note } = payload;
      const current = existingByDay.get(day);
      if (minutes <= 0) {
        if (current) {
          await this.timesheetEntryRepository.delete(current.id);
          existingByDay.delete(day);
        }
        continue;
      }

      if (current) {
        await this.timesheetEntryRepository.update(current.id, {
          durationMin: minutes,
          country: row.countryCode,
          workMode: this.mapLocationToWorkMode(this.normaliseRowLocation(row.location)),
          note,
          status: TimesheetEntryStatus.SAVED,
          statusUpdatedAt: new Date(),
        });
      } else {
        await this.timesheetEntryRepository.create({
          companyId,
          userId,
          timesheetId: row.timesheetId,
          timesheetRowId: row.id,
          actionCodeId: row.timeCodeId,
          day,
          durationMin: minutes,
          country: row.countryCode,
          workMode: this.mapLocationToWorkMode(this.normaliseRowLocation(row.location)),
          note,
          status: TimesheetEntryStatus.SAVED,
          statusUpdatedAt: new Date(),
        });
      }
    }

    for (const [day, entry] of existingByDay.entries()) {
      if (!entries.has(day)) {
        await this.timesheetEntryRepository.delete(entry.id);
      }
    }
  }

  private async getOrCreateWeekTimesheet(
    companyId: string,
    userId: string,
    weekStart: string,
  ): Promise<{ timesheet: Timesheet; created: boolean; range: { start: string; end: string } }> {
    const range = this.getWeekRange(weekStart);
    let timesheet = await this.timesheetRepository.findByPeriod(
      companyId,
      userId,
      range.start,
      range.end,
    );

    let created = false;
    if (!timesheet) {
      timesheet = await this.createTimesheet(companyId, userId, {
        periodStart: range.start,
        periodEnd: range.end,
      });
      created = true;
    }

    return { timesheet, created, range };
  }

  /**
   * @description Records an event related to a timesheet entity in the history.
   * @param companyId The unique identifier of the company.
   * @param payload An object containing details about the event.
   * @param payload.userId The unique identifier of the user associated with the event.
   * @param payload.targetType The type of the target entity (e.g., "Timesheet", "TimesheetEntry").
   * @param payload.targetId The unique identifier of the target entity.
   * @param payload.action The action performed (e.g., "created", "submitted", "approved", "rejected").
   * @param payload.actorUserId Optional: The unique identifier of the user who performed the action, if different from `userId`.
   * @param payload.reason Optional: A reason for the action.
   * @param payload.diff Optional: A record of changes made during an update.
   * @param payload.metadata Optional: Additional metadata related to the action.
   * @returns A Promise that resolves when the event is recorded.
   */
  private async recordEvent(
    companyId: string,
    payload: {
      userId: string;
      targetType: 'Timesheet' | 'TimesheetEntry';
      targetId: string;
      action: 'created' | 'submitted' | 'approved' | 'rejected' | 'updated';
      actorUserId?: string;
      reason?: string;
      diff?: Record<string, string>;
      metadata?: Record<string, string>;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.historyRepository.create({ companyId, ...payload } as any);
  }

  /**
   * @description Creates a new timesheet for a user within a specified company.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user for whom the timesheet is created.
   * @param dto The CreateTimesheetDto containing the period start and end dates, and optional notes.
   * @returns A Promise that resolves to the newly created Timesheet entity.
   * @throws {UnprocessableEntityError} If validation of the DTO fails.
   */
  public async createTimesheet(
    companyId: string,
    userId: string,
    dto: CreateTimesheetDto,
  ): Promise<Timesheet> {
    const validatedDto = await this.validateDto(CreateTimesheetDto, dto);

    const created = await this.timesheetRepository.create({
      companyId,
      userId,
      periodStart: validatedDto.periodStart,
      periodEnd: validatedDto.periodEnd,
      ...(validatedDto.notes !== undefined ? { notes: validatedDto.notes } : {}),
    });

    await this.recordEvent(companyId, {
      userId,
      targetType: 'Timesheet',
      targetId: created.id,
      action: 'created',
    });

    return created;
  }

  /**
   * @description Retrieves a single timesheet by its unique identifier, including its entries.
   * @param timesheetId The unique identifier of the timesheet.
   * @returns A Promise that resolves to the Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async getTimesheet(timesheetId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetRepository.findByIdWithEntries(timesheetId);
    if (!timesheet) {
      throw new NotFoundError('Timesheet not found');
    }
    return timesheet;
  }

  /**
   * @description Retrieves all timesheets for a specific user within a given company.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user.
   * @returns A Promise that resolves to an array of Timesheet entities.
   */
  public async getAllTimesheetsForUser(companyId: string, userId: string): Promise<Timesheet[]> {
    return this.timesheetRepository.findAllForUser(companyId, userId);
  }

  public async getWeekTimesheet(
    companyId: string,
    userId: string,
    weekStart: string,
  ): Promise<TimesheetWeekResponseDto> {
    const { timesheet, range } = await this.getOrCreateWeekTimesheet(companyId, userId, weekStart);
    let rows = await this.timesheetRowRepository.findAllForTimesheet(timesheet.id);

    let companySettings:
      | {
          defaultCountryCode?: string | null;
          defaultLocation?: string | null;
          maxWeeklyMinutes?: number;
          officeCountryCodes?: string[] | null;
        }
      | undefined;
    try {
      const fetchedSettings = await this.companySettingsRepository.getCompanySettings(companyId);
      companySettings = {
        defaultCountryCode: fetchedSettings.defaultCountryCode,
        defaultLocation: fetchedSettings.defaultLocation,
        maxWeeklyMinutes: fetchedSettings.maxWeeklyMinutes,
        officeCountryCodes: fetchedSettings.officeCountryCodes,
      };
    } catch (error) {
      companySettings = undefined;
    }

    if (rows.length === 0) {
      await this.backfillRowsFromLegacyEntries(companyId, userId, timesheet, companySettings);
      rows = await this.timesheetRowRepository.findAllForTimesheet(timesheet.id);
    }

    const rejectionInfo = await this.getTimesheetRejectionInfo(companyId, timesheet);

    const settings = this.toWeekSettings({
      defaultCountryCode: companySettings?.defaultCountryCode,
      defaultLocation: companySettings?.defaultLocation,
      maxWeeklyMinutes: companySettings?.maxWeeklyMinutes,
      officeCountryCodes: companySettings?.officeCountryCodes ?? undefined,
    });

    return {
      weekStart: range.start,
      weekEnd: range.end,
      status: timesheet.status,
      rows: rows.map((row) => this.mapRowToDto(row, rejectionInfo)),
      settings,
      rejection: rejectionInfo,
    };
  }

  public async upsertWeekTimesheet(
    companyId: string,
    userId: string,
    weekStart: string,
    dto: TimesheetWeekUpsertDto,
  ): Promise<TimesheetWeekResponseDto> {
    const validatedDto = await this.validateDto(TimesheetWeekUpsertDto, dto);
    const payloadRows = (validatedDto.rows ?? []).map((row) => {
      const rowInstance = plainToInstance(TimesheetWeekRowDto, row, {
        enableImplicitConversion: true,
      });
      rowInstance.countryCode = row.countryCode; // Explicitly set countryCode
      const entryList = Array.isArray(rowInstance.entries) ? rowInstance.entries : [];
      rowInstance.entries = entryList.map((entry) =>
        plainToInstance(TimesheetWeekRowEntryDto, entry, { enableImplicitConversion: true }),
      );
      return rowInstance;
    });

    const { timesheet, range } = await this.getOrCreateWeekTimesheet(companyId, userId, weekStart);
    const existingRows = await this.timesheetRowRepository.findAllForTimesheet(timesheet.id);
    const rowMap = new Map(existingRows.map((row) => [row.id, row]));
    let sortOrder = existingRows.reduce((max, row) => Math.max(max, row.sortOrder ?? 0), 0);

    let officeCountryCodes: string[] = [];
    let defaultCountryCode: string | undefined;
    try {
      const companySettings = await this.companySettingsRepository.getCompanySettings(companyId);
      officeCountryCodes = (companySettings.officeCountryCodes ?? []).map((code) =>
        code.toUpperCase(),
      );
      defaultCountryCode = companySettings.defaultCountryCode
        ? companySettings.defaultCountryCode.toUpperCase()
        : undefined;
    } catch {
      officeCountryCodes = [];
      defaultCountryCode = undefined;
    }
    if (officeCountryCodes.length === 0 && defaultCountryCode) {
      officeCountryCodes = [defaultCountryCode];
    } else if (defaultCountryCode && !officeCountryCodes.includes(defaultCountryCode)) {
      officeCountryCodes.push(defaultCountryCode);
    }
    const officeCountrySet = new Set(officeCountryCodes);

    const payloadIds = new Set<string>();

    for (const payloadRow of payloadRows) {
      if (payloadRow.id) {
        payloadIds.add(payloadRow.id);
      }

      const entriesMap = this.normaliseEntries(payloadRow.entries);
      const location = this.normaliseRowLocation(payloadRow.location);
      const resolvedCountryCode =
        payloadRow.countryCode && payloadRow.countryCode.trim().length > 0
          ? payloadRow.countryCode
          : defaultCountryCode;
      const countryCode = resolvedCountryCode?.toUpperCase();
      console.log('payloadRow.countryCode:', payloadRow.countryCode);
      console.log('countryCode:', countryCode);
      const employeeCountryCode = payloadRow.employeeCountryCode
        ? payloadRow.employeeCountryCode.toUpperCase()
        : undefined;

      if (!countryCode) {
        throw new UnprocessableEntityError('Country code is required for all timesheet rows.');
      }

      if (
        (location === TimesheetRowLocation.OFFICE || location === TimesheetRowLocation.HYBRID) &&
        !officeCountrySet.has(countryCode)
      ) {
        throw new UnprocessableEntityError(
          'Selected country is not a configured company office for office or hybrid work.',
        );
      }

      if (location === TimesheetRowLocation.HYBRID && !employeeCountryCode) {
        throw new UnprocessableEntityError(
          'Hybrid entries must include an employee location country.',
        );
      }

      const normalizedEmployeeCountry =
        location === TimesheetRowLocation.HYBRID ? (employeeCountryCode ?? null) : null;

      if (payloadRow.id) {
        const existingRow = rowMap.get(payloadRow.id);
        if (!existingRow) {
          throw new NotFoundError('Timesheet row not found.');
        }
        if (existingRow.locked) {
          throw new UnprocessableEntityError('Timesheet row is locked and cannot be edited.');
        }

        const updatePayload: Partial<TimesheetRow> = {
          activityLabel: payloadRow.activityLabel,
          timeCodeId: payloadRow.timeCodeId,
          billable: payloadRow.billable,
          location,
          countryCode,
          employeeCountryCode: normalizedEmployeeCountry,
          status: payloadRow.status,
          locked:
            payloadRow.locked ??
            (payloadRow.status === TimesheetRowStatus.SUBMITTED ||
              payloadRow.status === TimesheetRowStatus.APPROVED),
        };

        await this.timesheetRowRepository.update(existingRow.id, updatePayload);
        Object.assign(existingRow, updatePayload);
        await this.syncRowEntries(existingRow, entriesMap, companyId, userId);
      } else {
        sortOrder += 1;
        const newRow = await this.timesheetRowRepository.create({
          companyId,
          userId,
          timesheetId: timesheet.id,
          activityLabel: payloadRow.activityLabel,
          timeCodeId: payloadRow.timeCodeId,
          billable: payloadRow.billable ?? TimesheetRowBillableTag.AUTO,
          location,
          countryCode,
          employeeCountryCode: normalizedEmployeeCountry,
          status: payloadRow.status ?? TimesheetRowStatus.DRAFT,
          locked:
            payloadRow.locked ??
            (payloadRow.status === TimesheetRowStatus.SUBMITTED ||
              payloadRow.status === TimesheetRowStatus.APPROVED),
          sortOrder,
        });

        const hydratedRow: TimesheetRow = {
          ...newRow,
          entries: [],
        } as TimesheetRow;
        await this.syncRowEntries(hydratedRow, entriesMap, companyId, userId);
      }
    }

    for (const existingRow of existingRows) {
      if (existingRow.locked) continue;
      if (!existingRow.id) continue;
      if (!payloadIds.has(existingRow.id)) {
        await this.timesheetRowRepository.delete(existingRow.id);
      }
    }

    const refreshedRows = await this.timesheetRowRepository.findAllForTimesheet(timesheet.id);
    const totalMinutes = refreshedRows.reduce((weekTotal, row) => {
      const rowTotal = (row.entries ?? []).reduce((sum, entry) => sum + entry.durationMin, 0);
      return weekTotal + rowTotal;
    }, 0);

    await this.timesheetRepository.update(timesheet.id, { totalMinutes });

    return this.getWeekTimesheet(companyId, userId, range.start);
  }

  public async submitWeekTimesheet(
    companyId: string,
    userId: string,
    weekStart: string,
    dto?: TimesheetWeekSubmitDto,
  ): Promise<TimesheetWeekResponseDto> {
    if (dto) {
      await this.validateDto(TimesheetWeekSubmitDto, dto);
    }
    const { timesheet, range } = await this.getOrCreateWeekTimesheet(companyId, userId, weekStart);
    const rows = await this.timesheetRowRepository.findAllForTimesheet(timesheet.id);

    for (const row of rows) {
      if (row.status === TimesheetRowStatus.APPROVED || row.locked) {
        continue;
      }

      await this.timesheetRowRepository.update(row.id, {
        status: TimesheetRowStatus.SUBMITTED,
        locked: true,
      });

      for (const entry of row.entries ?? []) {
        await this.timesheetEntryRepository.update(entry.id, {
          status: TimesheetEntryStatus.PENDING_APPROVAL,
          statusUpdatedAt: new Date(),
        });
      }
    }

    await this.timesheetRepository.update(timesheet.id, {
      status: TimesheetStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedByUserId: userId,
    });

    await this.recordEvent(companyId, {
      userId,
      targetType: 'Timesheet',
      targetId: timesheet.id,
      action: 'submitted',
    });

    return this.getWeekTimesheet(companyId, userId, range.start);
  }

  /**
   * @description Updates an existing timesheet.
   * @param companyId The unique identifier of the company.
   * @param timesheetId The unique identifier of the timesheet to update.
   * @param userId The unique identifier of the user performing the update.
   * @param dto The UpdateTimesheetDto containing the updated timesheet details.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If validation of the DTO fails or timesheet is not in DRAFT status.
   */
  public async updateTimesheet(
    companyId: string,
    timesheetId: string,
    userId: string,
    dto: UpdateTimesheetDto,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.DRAFT) {
      throw new UnprocessableEntityError('Only timesheets in DRAFT status can be updated.');
    }

    const validatedDto = await this.validateDto(UpdateTimesheetDto, dto);
    const updatePayload: Partial<UpdateTimesheetDto> = {};
    if (validatedDto.periodStart !== undefined) {
      updatePayload.periodStart = validatedDto.periodStart;
    }
    if (validatedDto.periodEnd !== undefined) {
      updatePayload.periodEnd = validatedDto.periodEnd;
    }
    if (validatedDto.notes !== undefined) {
      updatePayload.notes = validatedDto.notes;
    }

    const updated = await this.timesheetRepository.update(timesheetId, updatePayload);

    await this.recordEvent(companyId, {
      userId,
      targetType: 'Timesheet',
      targetId: timesheetId,
      action: 'updated',
      diff: updatePayload as Record<string, string>,
    });

    return updated!;
  }

  /**
   * @description Adds a new entry to an existing timesheet.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user who owns the timesheet.
   * @param timesheetId The unique identifier of the timesheet to add the entry to.
   * @param dto The CreateTimesheetEntryDto containing the details of the new timesheet entry.
   * @returns A Promise that resolves to the updated Timesheet entity with the new entry.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async addTimesheetEntry(
    companyId: string,
    userId: string,
    timesheetId: string,
    dto: CreateTimesheetEntryDto,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    const newEntry = await this.timesheetEntryRepository.create({
      companyId,
      userId,
      timesheetId,
      ...dto,
    });

    const newTotal = (timesheet.totalMinutes ?? 0) + newEntry.durationMin;
    await this.timesheetRepository.update(timesheetId, {
      totalMinutes: newTotal,
    });

    await this.recordEvent(companyId, {
      userId,
      targetType: 'TimesheetEntry',
      targetId: newEntry.id,
      action: 'created',
      metadata: { timesheetId },
    });

    return this.getTimesheet(timesheetId);
  }

  /**
   * @description Submits a timesheet for approval. Changes its status from DRAFT to SUBMITTED.
   * @param companyId The unique identifier of the company.
   * @param userId The unique identifier of the user submitting the timesheet.
   * @param timesheetId The unique identifier of the timesheet to submit.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in DRAFT status.
   */
  public async submitTimesheet(
    companyId: string,
    userId: string,
    timesheetId: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.DRAFT) {
      throw new UnprocessableEntityError('Timesheet is not in draft status');
    }

    const updated = await this.timesheetRepository.update(timesheetId, {
      status: TimesheetStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedByUserId: userId,
    });

    await this.recordEvent(companyId, {
      userId,
      targetType: 'Timesheet',
      targetId: timesheetId,
      action: 'submitted',
    });

    return updated!;
  }

  /**
   * @description Approves a submitted timesheet. Changes its status from SUBMITTED to APPROVED.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the user approving the timesheet.
   * @param timesheetId The unique identifier of the timesheet to approve.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
  public async approveTimesheet(
    companyId: string,
    approverId: string,
    timesheetId: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError('Timesheet is not in submitted status');
    }

    const updated = await this.timesheetRepository.update(timesheetId, {
      status: TimesheetStatus.APPROVED,
      approvedAt: new Date(),
      approverId,
    });

    await this.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: 'Timesheet',
      targetId: timesheetId,
      action: 'approved',
      actorUserId: approverId,
    });

    return updated!;
  }

  /**
   * @description Rejects a submitted timesheet. Changes its status from SUBMITTED to REJECTED.
   * @param companyId The unique identifier of the company.
   * @param approverId The unique identifier of the user rejecting the timesheet.
   * @param timesheetId The unique identifier of the timesheet to reject.
   * @param reason The reason for rejecting the timesheet.
   * @returns A Promise that resolves to the updated Timesheet entity.
   * @throws {NotFoundError} If the timesheet is not found.
   * @throws {UnprocessableEntityError} If the timesheet is not in SUBMITTED status.
   */
  public async rejectTimesheet(
    companyId: string,
    approverId: string,
    timesheetId: string,
    reason: string,
  ): Promise<Timesheet> {
    const timesheet = await this.getTimesheet(timesheetId);

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new UnprocessableEntityError('Timesheet is not in submitted status');
    }

    const updated = await this.timesheetRepository.update(timesheetId, {
      status: TimesheetStatus.REJECTED,
    });

    const rows = await this.timesheetRowRepository.findAllForTimesheet(timesheetId);
    for (const row of rows) {
      await this.timesheetRowRepository.update(row.id, {
        status: TimesheetRowStatus.REJECTED,
        locked: false,
      });

      for (const entry of row.entries ?? []) {
        await this.timesheetEntryRepository.update(entry.id, {
          status: TimesheetEntryStatus.REJECTED,
          statusUpdatedAt: new Date(),
        });
      }
    }

    await this.recordEvent(companyId, {
      userId: timesheet.userId,
      targetType: 'Timesheet',
      targetId: timesheetId,
      action: 'rejected',
      actorUserId: approverId,
      reason,
    });

    return updated!;
  }

  /**
   * @description Soft deletes a timesheet by its unique identifier.
   * @param timesheetId The unique identifier of the timesheet to soft delete.
   * @returns A Promise that resolves when the soft deletion is complete.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async softDeleteTimesheet(timesheetId: string): Promise<void> {
    const timesheet = await this.getTimesheet(timesheetId);
    await this.timesheetRepository.softDelete(timesheet.id);
  }

  /**
   * @description Permanently deletes a timesheet by its unique identifier from the database. This operation is irreversible.
   * @param timesheetId The unique identifier of the timesheet to hard delete.
   * @returns A Promise that resolves when the hard deletion is complete.
   * @throws {NotFoundError} If the timesheet is not found.
   */
  public async hardDeleteTimesheet(timesheetId: string): Promise<void> {
    const timesheet = await this.timesheetRepository.findById(timesheetId, true);
    if (!timesheet) {
      throw new NotFoundError('Timesheet not found.');
    }
    await this.timesheetRepository.delete(timesheet.id);
  }
}
