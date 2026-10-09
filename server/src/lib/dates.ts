export const APP_TZ = 'Europe/Moscow';

export interface Range {
  start: Date;
  end: Date;
}

export function monthRange(year: number, month: number): Range {
  const start = new Date(Date.UTC(year, month - 1, 1, -3));
  const end = new Date(Date.UTC(year, month, 1, -3));
  return { start, end };
}

export function currentMonth(now = new Date()): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  return { year, month };
}

export function previousMonth(now = new Date()): { year: number; month: number } {
  const { year, month } = currentMonth(now);
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function dayOfMonth(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, day: '2-digit' }).format(now),
  );
}