import { ContentCopy, DeleteOutline, Replay } from '@mui/icons-material';
import {
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';

import type { WeeklyRowState } from '@/hooks/useTimesheet';
import {
  ActionCode,
  ActionCodeLocationPolicy,
  TimesheetRowBillableTag,
  TimesheetRowLocation,
  TimesheetRowStatus,
  TimesheetStatus,
  TimesheetWeekRejectionDto,
  TimesheetWeekRowRejectionDto,
} from '@/lib/api';
import type { WeekDate } from '@/types/timesheet';
import { formatMinutes } from '@/utils/timeFormatting';
import { resolveDefaultBillable, resolveDefaultLocation } from '@/utils/timesheetRow';

import { EditableTimeCell } from './EditableTimeCell';

interface TimesheetRowEditorProps {
  row: WeeklyRowState;
  rowIndex: number;
  rowCount: number;
  gridId: string;
  weekDates: WeekDate[];
  timeCodes: ActionCode[];
  countries: { code: string; name: string; hasOffice: boolean }[];
  onUpdateRow: (rowId: string, patch: Partial<WeeklyRowState>) => void;
  onUpdateEntry: (rowId: string, day: string, patch: { minutes?: number }) => void;
  onDuplicate: () => void;
  onClear: () => void;
  onRemove: () => void;
  timesheetStatus?: TimesheetStatus;
  rowRejection?: TimesheetWeekRowRejectionDto;
  timesheetRejection?: TimesheetWeekRejectionDto;
}

export const TimesheetRowEditor = ({
  row,
  rowIndex,
  rowCount,
  gridId,
  weekDates,
  timeCodes,
  countries,
  onUpdateRow,
  onUpdateEntry,
  onDuplicate,
  onClear,
  onRemove,
  timesheetStatus,
  rowRejection,
  timesheetRejection,
}: TimesheetRowEditorProps) => {
  const theme = useTheme();
  const rowKey = row.id ?? row.clientId;
  const timeCode = timeCodes.find((code) => code.id === row.timeCodeId);
  const timeCodeName = timeCode?.name ?? row.timeCodeName ?? row.activityLabel ?? '—';
  const timeCodeCode = timeCode?.code ?? row.timeCodeCode ?? '';
  const billableLocked = timeCode?.billableEditable === false;
  const locationLocked =
    timeCode?.locationPolicy === ActionCodeLocationPolicy.OFFICE_ONLY ||
    timeCode?.locationPolicy === ActionCodeLocationPolicy.HOMEWORKING_ONLY;
  const normalizedCode = timeCodeCode.toUpperCase();
  const isHolidayRow = normalizedCode === 'HOLIDAY';
  const isSickRow = normalizedCode === 'SICK';
  const isLeaveRow = isHolidayRow || isSickRow;
  const enforcedLocation = resolveDefaultLocation(timeCode, row.location);
  const effectiveLocation =
    locationLocked || isLeaveRow
      ? isSickRow
        ? TimesheetRowLocation.HOMEWORKING
        : enforcedLocation
      : row.location;
  const rowDisplayLabel = row.activityLabel || timeCode?.name || timeCode?.code || 'Timesheet row';
  const activeRejection =
    rowRejection ?? (timesheetStatus === TimesheetStatus.REJECTED ? timesheetRejection : undefined);
  const isRejected = row.status === TimesheetRowStatus.REJECTED || Boolean(activeRejection);

  const officeCountries = useMemo(
    () => countries.filter((country) => country.hasOffice),
    [countries],
  );
  const officeCountryCodes = useMemo(
    () => new Set(officeCountries.map((country) => country.code)),
    [officeCountries],
  );
  const requiresOfficeCountry =
    effectiveLocation === TimesheetRowLocation.OFFICE ||
    effectiveLocation === TimesheetRowLocation.HYBRID;
  const primaryCountryOptions = useMemo(() => {
    if (requiresOfficeCountry) return officeCountries;
    return countries;
  }, [requiresOfficeCountry, officeCountries, countries]);
  const employeeCountryOptions = countries;

  useEffect(() => {
    if ((locationLocked || isLeaveRow) && row.location !== effectiveLocation) {
      onUpdateRow(rowKey, { location: effectiveLocation });
    }
  }, [locationLocked, isLeaveRow, effectiveLocation, row.location, onUpdateRow, rowKey]);

  useEffect(() => {
    if (row.locked) return;
    if (requiresOfficeCountry && row.countryCode && !officeCountryCodes.has(row.countryCode)) {
      const fallback = officeCountries[0]?.code;
      if (fallback && fallback !== row.countryCode) {
        onUpdateRow(rowKey, { countryCode: fallback });
      }
    }
    if (requiresOfficeCountry && !row.countryCode && officeCountries.length > 0) {
      onUpdateRow(rowKey, { countryCode: officeCountries[0].code });
    }
  }, [
    requiresOfficeCountry,
    officeCountryCodes,
    officeCountries,
    row.countryCode,
    row.locked,
    onUpdateRow,
    rowKey,
  ]);

  useEffect(() => {
    if (row.locked) return;
    if (effectiveLocation === TimesheetRowLocation.OFFICE) {
      if (row.employeeCountryCode !== null) {
        onUpdateRow(rowKey, { employeeCountryCode: null });
      }
      return;
    }

    const preferredEmployeeCountry = row.employeeCountryCode ?? row.countryCode;
    if (!preferredEmployeeCountry && employeeCountryOptions.length > 0) {
      onUpdateRow(rowKey, { employeeCountryCode: employeeCountryOptions[0].code });
    } else if (preferredEmployeeCountry && row.employeeCountryCode !== preferredEmployeeCountry) {
      onUpdateRow(rowKey, { employeeCountryCode: preferredEmployeeCountry });
    }
  }, [
    effectiveLocation,
    row.employeeCountryCode,
    row.countryCode,
    employeeCountryOptions,
    row.locked,
    onUpdateRow,
    rowKey,
  ]);

  useEffect(() => {
    if (billableLocked && timeCode) {
      const defaultBillable = resolveDefaultBillable(timeCode);
      if (row.billable !== defaultBillable) {
        onUpdateRow(rowKey, { billable: defaultBillable });
      }
    }
  }, [billableLocked, timeCode, row.billable, onUpdateRow, rowKey]);

  const handleLocationChange = (nextLocation: TimesheetRowLocation) => {
    if (row.locked || isLeaveRow) return;
    const patch: Partial<WeeklyRowState> = { location: nextLocation };
    if (
      (nextLocation === TimesheetRowLocation.OFFICE ||
        nextLocation === TimesheetRowLocation.HYBRID) &&
      officeCountries.length > 0
    ) {
      const candidate = officeCountryCodes.has(row.countryCode)
        ? row.countryCode
        : officeCountries[0].code;
      if (candidate && candidate !== row.countryCode) {
        patch.countryCode = candidate;
      }
    }
    if (nextLocation === TimesheetRowLocation.OFFICE) {
      patch.employeeCountryCode = null;
    } else {
      const preferred =
        row.employeeCountryCode ??
        row.countryCode ??
        employeeCountryOptions[0]?.code ??
        officeCountries[0]?.code ??
        null;
      patch.employeeCountryCode = preferred;
    }
    onUpdateRow(rowKey, patch);
  };

  const tooltipTitle =
    activeRejection &&
    [
      activeRejection.reason ? `Reason: ${activeRejection.reason}` : null,
      activeRejection.actorName
        ? `By: ${activeRejection.actorName}`
        : activeRejection.actorId
          ? `By: ${activeRejection.actorId}`
          : null,
      activeRejection.occurredAt
        ? `At: ${new Date(activeRejection.occurredAt).toLocaleString()}`
        : null,
    ]
      .filter(Boolean)
      .join(' • ');

  const displayStatus =
    row.status === TimesheetRowStatus.SUBMITTED ? 'pending' : row.status.replace(/_/g, ' ');

  const rowNode = (
    <TableRow
      key={row.clientId}
      hover
      sx={{
        opacity: row.locked ? 0.65 : 1,
        transition: 'background-color 120ms ease-in-out',
        ...(isRejected
          ? {
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.16),
              },
            }
          : {}),
      }}
    >
      <TableCell sx={{ minWidth: 220 }}>
        <TextField
          size="small"
          value={row.activityLabel}
          onChange={(event) => onUpdateRow(rowKey, { activityLabel: event.target.value })}
          disabled={row.locked}
          fullWidth
          label="Activity"
        />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {timeCodeName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {timeCodeCode}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 140 }}>
        <Select
          size="small"
          fullWidth
          value={effectiveLocation}
          disabled={row.locked || locationLocked || isLeaveRow}
          onChange={(event) => handleLocationChange(event.target.value as TimesheetRowLocation)}
        >
          <MenuItem value={TimesheetRowLocation.OFFICE}>Office</MenuItem>
          <MenuItem value={TimesheetRowLocation.HOMEWORKING}>Homeworking</MenuItem>
          <MenuItem value={TimesheetRowLocation.HYBRID}>Hybrid</MenuItem>
        </Select>
      </TableCell>
      <TableCell sx={{ width: 160 }}>
        <Select
          size="small"
          fullWidth
          value={row.countryCode || ''}
          displayEmpty
          disabled={
            row.locked ||
            isLeaveRow ||
            (requiresOfficeCountry && primaryCountryOptions.length === 0)
          }
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography variant="body2" color="text.secondary">
                  Select country
                </Typography>
              );
            }
            const match = countries.find((country) => country.code === selected);
            return match?.name ?? selected;
          }}
          onChange={(event) =>
            onUpdateRow(rowKey, {
              countryCode: event.target.value,
            })
          }
        >
          {primaryCountryOptions.length === 0 ? (
            <MenuItem value="" disabled>
              {requiresOfficeCountry ? 'No office locations configured' : 'No countries available'}
            </MenuItem>
          ) : (
            primaryCountryOptions.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.name}
              </MenuItem>
            ))
          )}
        </Select>
      </TableCell>
      <TableCell sx={{ width: 160 }}>
        {effectiveLocation !== TimesheetRowLocation.OFFICE ? (
          <Select
            size="small"
            fullWidth
            value={row.employeeCountryCode || ''}
            displayEmpty
            disabled={row.locked}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    Employee country
                  </Typography>
                );
              }
              const match = employeeCountryOptions.find((country) => country.code === selected);
              return match?.name ?? selected;
            }}
            onChange={(event) =>
              onUpdateRow(rowKey, {
                employeeCountryCode: event.target.value || null,
              })
            }
          >
            {employeeCountryOptions.map((country) => (
              <MenuItem key={country.code} value={country.code}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ width: 160 }}>
        <Select
          size="small"
          fullWidth
          value={row.billable}
          disabled={row.locked || billableLocked}
          onChange={(event) =>
            onUpdateRow(rowKey, {
              billable: event.target.value as TimesheetRowBillableTag,
            })
          }
        >
          <MenuItem value={TimesheetRowBillableTag.BILLABLE}>Billable</MenuItem>
          <MenuItem value={TimesheetRowBillableTag.NON_BILLABLE}>Non-billable</MenuItem>
          <MenuItem value={TimesheetRowBillableTag.AUTO}>Auto</MenuItem>
        </Select>
      </TableCell>
      <TableCell sx={{ width: 180 }}>
        <Chip
          label={displayStatus}
          color={
            row.status === TimesheetRowStatus.APPROVED
              ? 'success'
              : row.status === TimesheetRowStatus.REJECTED || isRejected
                ? 'error'
                : row.status === TimesheetRowStatus.SUBMITTED
                  ? 'warning'
                  : 'default'
          }
          size="small"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      </TableCell>
      {weekDates.map((day, dayIndex) => {
        const entry = row.entries[day.iso];
        const value = entry?.minutes ?? 0;
        return (
          <TableCell key={day.iso} sx={{ width: 110 }} align="right">
            <EditableTimeCell
              gridId={gridId}
              rowKey={rowKey}
              rowLabel={rowDisplayLabel}
              rowIndex={rowIndex}
              rowCount={rowCount}
              dayIndex={dayIndex}
              dayCount={weekDates.length}
              dayIso={day.iso}
              dayLabel={day.label}
              minutes={value}
              disabled={row.locked}
              onCommit={(payload) => onUpdateEntry(rowKey, day.iso, payload)}
            />
          </TableCell>
        );
      })}
      <TableCell align="right" sx={{ width: 120 }}>
        <Typography variant="body2" fontWeight={600}>
          {formatMinutes(Object.values(row.entries).reduce((acc, entry) => acc + entry.minutes, 0))}
        </Typography>
      </TableCell>
      <TableCell align="right" sx={{ width: 140 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Duplicate row">
            <span>
              <IconButton size="small" onClick={onDuplicate} disabled={row.locked}>
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Clear row">
            <span>
              <IconButton size="small" onClick={onClear} disabled={row.locked}>
                <Replay fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove row">
            <span>
              <IconButton size="small" onClick={onRemove} disabled={row.locked}>
                <DeleteOutline fontSize="inherit" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return activeRejection && tooltipTitle ? (
    <Tooltip title={tooltipTitle} arrow>
      {rowNode}
    </Tooltip>
  ) : (
    rowNode
  );
};

export default TimesheetRowEditor;
