const TZ = 'Europe/Moscow';

export interface MonthMeta {
  year: number;
  month: number;

  label: string;
  daysPassed: number;
  daysInMonth: number;
  range: { startDate: string; endDate: string };
}

function partsIn(tz: string, date: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

export function monthMeta(offset = 0, now = new Date()): MonthMeta {
  const here = partsIn(TZ, now);
  const base = new Date(Date.UTC(here.year, here.month - 1 + offset, 1));
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + 1;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const isCurrent = offset === 0;
  const daysPassed = isCurrent ? here.day : daysInMonth;

  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    year,
    month,
    label: new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
      .format(new Date(year, month - 1, 1))
      .replace(' г.', ''),
    daysPassed,
    daysInMonth,
    range: {
      startDate: `${year}-${pad(month)}-01`,
      endDate: `${year}-${pad(month)}-${pad(daysInMonth)}`,
    },
  };
}
