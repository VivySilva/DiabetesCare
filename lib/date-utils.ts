export const DAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Evita que strings "YYYY-MM-DD" virem o dia anterior no fuso UTC-3. */
export function parseRecordDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (!value) return new Date(NaN);

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // If timestamp comes from Supabase without timezone (e.g. "2026-06-23T22:00:00"), force UTC
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return new Date(trimmed.replace(' ', 'T') + 'Z');
  }

  return new Date(trimmed);
}

export function getDayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()];
}

export function startOfLocalDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function recordsForLocalDate<T extends { created_at: string }>(records: T[], date: Date): T[] {
  const dateKey = toLocalDateKey(date);
  return records.filter(
    (record) => toLocalDateKey(parseRecordDate(record.created_at)) === dateKey,
  );
}

export function buildWeeklyChartDays(referenceDate = new Date()) {
  const today = startOfLocalDay(referenceDate);
  const days = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysAgo);
    days.push({
      label: getDayLabel(targetDate),
      date: targetDate,
    });
  }

  return days;
}
