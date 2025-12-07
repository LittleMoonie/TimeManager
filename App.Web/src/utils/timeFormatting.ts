const pad2 = (value: number): string => value.toString().padStart(2, '0');

export const formatMinutes = (minutes: number | undefined): string => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}:${pad2(mins)}`;
};

export const formatDecimalHours = (minutes: number | undefined): string => {
  if (!minutes) return '';
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours.toString();
  }
  return hours.toFixed(2).replace(/\.?0+$/, '');
};

export const parseMinutesInput = (value: string, currentValue = 0): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (trimmed.startsWith('+') || trimmed.startsWith('-')) {
    const delta = parseMinutesInput(trimmed.slice(1), 0);
    if (delta == null) return currentValue;
    return trimmed.startsWith('-') ? Math.max(0, currentValue - delta) : currentValue + delta;
  }

  if (/^\d+:\d{1,2}$/.test(trimmed)) {
    const [h, m] = trimmed.split(':').map(Number);
    return h * 60 + m;
  }

  if (/^\d+(\.\d+)?h$/.test(trimmed.toLowerCase())) {
    const numeric = Number.parseFloat(trimmed.toLowerCase().replace('h', ''));
    if (Number.isNaN(numeric)) return null;
    return Math.round(numeric * 60);
  }

  const mixedHours = trimmed.toLowerCase().match(/^(\d+)h(\d{1,2})m?$/);
  if (mixedHours) {
    const hours = Number.parseInt(mixedHours[1], 10);
    const mins = Number.parseInt(mixedHours[2], 10);
    if (Number.isNaN(hours) || Number.isNaN(mins) || mins >= 60) {
      return null;
    }
    return hours * 60 + mins;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    if (trimmed.includes('.')) {
      return Math.round(Number.parseFloat(trimmed) * 60);
    }
    return Number.parseInt(trimmed, 10);
  }

  if (/^\d+m$/.test(trimmed.toLowerCase())) {
    return Number.parseInt(trimmed.toLowerCase().replace('m', ''), 10);
  }

  return null;
};

export const parseTimeOfDay = (value: string): number | null => {
  const trimmed = value.trim();
  if (!/^(\d{1,2}):(\d{2})$/.test(trimmed)) {
    return null;
  }

  const [hoursStr, minutesStr] = trimmed.split(':');
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 24) return null;
  if (minutes < 0 || minutes >= 60) return null;
  if (hours === 24 && minutes > 0) return null;

  return Math.min(hours * 60 + minutes, 24 * 60);
};

export const formatTimeOfDay = (minutesFromMidnight: number): string => {
  if (!Number.isFinite(minutesFromMidnight)) {
    return '00:00';
  }
  const normalized = ((Math.round(minutesFromMidnight) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
};
