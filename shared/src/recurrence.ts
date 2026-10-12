export const RECURRING_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type RecurringPeriod = (typeof RECURRING_PERIODS)[number];

export function nextOccurrence(from: Date, period: RecurringPeriod, anchorDay?: number): Date {
    const d = new Date(from.getTime());

    switch (period) {
        case 'daily':
            d.setUTCDate(d.getUTCDate() + 1);
            return d;

        case 'weekly': 
            d.setUTCDate(d.getUTCDate() + 7);
            return d;
        
        case 'monthly':
        case 'yearly': {
            const day = anchorDay ?? d.getUTCDate();
            const monthStep = period === 'monthly' ? 1 : 12;
            const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + monthStep, 1));
            const lastDay = new Date(
                Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1,
            0),
            ).getUTCDate();
            target.setUTCDate(Math.min(day, lastDay));
            target.setUTCHours(d.getUTCHours(), d.getUTCMinutes(), 0, 0);
            return target;
        }
    }
}

export const PERIOD_KEY: Record<RecurringPeriod, string> = {
    daily: 'recurrence.daily',
    weekly: 'recurrence.weekly',
    monthly: 'recurrence.monthly',
    yearly: 'recurrence.yearly',
};