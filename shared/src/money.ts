declare const MINOR: unique symbol;

export type Minor = number & { readonly [MINOR]: true };

export const CURRENCIES = ['RUB', 'USD', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};

export function minor(value: number): Minor {
    if (!Number.isInteger(value)) {
        throw new RangeError(`Minor units must be an integer, got ${value}`);
    }
    return value as Minor;
}

export const ZERO = minor(0);

export function parseMinor(input: string): Minor | null {
  const cleaned = input.replace(/[\s\u00A0\u202F]/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const negative = cleaned.startsWith('-');
  const [whole = '0', frac = ''] = cleaned.replace('-', '').split('.');
  const units = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return minor(negative ? -units : units);
}

export const addMinor = (a: Minor, b: Minor): Minor => minor(a + b);
export const subMinor = (a: Minor, b: Minor): Minor => minor(a - b);
export const sumMinor = (xs: readonly Minor[]): Minor =>
  xs.reduce<Minor>((acc, x) => minor(acc + x), ZERO);

export function ratioPercent(part: Minor, whole: Minor): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

export function formatMoney(
  value: Minor,
  currency: Currency,
  opts: { cents?: boolean; sign?: boolean; locale?: string } = {},
): string {
  const { cents = false, sign = false, locale = 'ru-RU' } = opts;
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value / 100);
  if (!sign) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return formatted.replace('-', '\u2212');
  return formatted;
}

export function formatAmount(value: Minor, opts: { cents?: boolean } = {}): string {
  const { cents = false } = opts;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value / 100);
}

export const asMinor = (n: number): Minor => n as Minor;