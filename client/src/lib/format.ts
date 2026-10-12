import { CURRENCY_SYMBOL, type Currency, type Minor } from '@accountant/shared';
import { currentLocale } from '../i18n';

export { CURRENCY_SYMBOL };

export function formatMoney(value: Minor, currency: Currency, opts: { cents?: boolean; sign?: boolean } = {}): string {
  const { cents = false, sign = false } = opts;
  const formatted = new Intl.NumberFormat(currentLocale(), {
    style: 'currency', currency,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value / 100);
  if (!sign) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return formatted.replace('-', '\u2212');
  return formatted;
}

export function formatAmount(value: Minor, opts: { cents?: boolean } = {}): string {
  return new Intl.NumberFormat(currentLocale(), {
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : 0,
  }).format(value / 100);
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), { day: 'numeric', month: 'short' })
    .format(new Date(iso)).replace('.', '').toUpperCase();
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat(currentLocale(), { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1)).replace(' г.', '');
}