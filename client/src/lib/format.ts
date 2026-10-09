// client/src/lib/format.ts
import { formatAmount, formatMoney, CURRENCY_SYMBOL, type Currency, type Minor } from '@accountant/shared';

export { formatMoney, formatAmount, CURRENCY_SYMBOL };

export function splitMoney(value: Minor, currency: Currency) {
  return { amount: formatAmount(value), symbol: CURRENCY_SYMBOL[currency] };
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `СЕГОДНЯ ${new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(d)}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'ВЧЕРА';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
    .format(d)
    .replace('.', '')
    .toUpperCase();
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}