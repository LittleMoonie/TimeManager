export const formatMinutes = (minutes: number | undefined): string => {
  if (!minutes) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}:${mins.toString().padStart(2, '0')}`;
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
