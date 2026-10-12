import type { Currency, Minor } from '@accountant/shared';
import { formatMoney, splitMoney, plural } from '../../lib/format';
import styles from './Hero.module.css';

interface HeroProps {
  monthLabel: string;
  remaining: Minor;
  budget: Minor;
  spent: Minor;
  forecast: Minor;
  daysPassed: number;
  daysInMonth: number;
  currency: Currency;
}

type Tone = 'ok' | 'warn' | 'over';

export default function Hero({
  monthLabel, remaining, budget, spent, forecast,
  daysPassed, daysInMonth, currency,
}: HeroProps) {
  const hasBudget = budget > 0;
  const spentRatio = hasBudget ? spent / budget : 0;
  const timeRatio = daysPassed / daysInMonth;
  const daysLeft = Math.max(0, daysInMonth - daysPassed);
  const perDay = daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0;

  const tone: Tone = !hasBudget ? 'ok'
    : forecast > budget * 1.05 ? 'over'
    : spentRatio > timeRatio + 0.08 ? 'warn'
    : 'ok';

  const verdict: Record<Tone, string> = {
    ok: 'Идёте по плану',
    warn: 'Тратите быстрее плана',
    over: 'Бюджет не сойдётся',
  };

  const over = remaining < 0;
  const { amount, symbol } = splitMoney(Math.abs(remaining) as Minor, currency);

  return (
    <section className={styles.hero}>
      <p className={styles.label}>
        {over ? 'Перерасход' : 'Остаток'} · {monthLabel}
      </p>

      <p className={styles.value} data-over={over || undefined}>
        {over && <span className={styles.sign} aria-hidden>−</span>}
        <span className="u-sr">{over ? 'минус ' : ''}</span>
        {amount}
        <span className={styles.symbol}>{symbol}</span>
      </p>

      {hasBudget && (
        <>
          <p className={styles.status} data-tone={tone}>
            <span className={styles.dot} aria-hidden />
            {verdict[tone]} · прогноз{' '}
            <b className="u-num u-nowrap">{formatMoney(forecast, currency)}</b>
          </p>

          <p className={styles.sub}>
            {over ? (
              <>
                Бюджет <b className="u-num u-nowrap">{formatMoney(budget, currency)}</b> превышен на{' '}
                <b className="u-num u-nowrap">{formatMoney(Math.abs(remaining) as Minor, currency)}</b>,
                а до конца месяца ещё{' '}
                <b className="u-num u-nowrap">{daysLeft} {plural(daysLeft, 'день', 'дня', 'дней')}</b>.
              </>
            ) : (
              <>
                Из <b className="u-num u-nowrap">{formatMoney(budget, currency)}</b> осталось{' '}
                <b className="u-num u-nowrap">{formatMoney(remaining, currency)}</b> на{' '}
                <b className="u-num u-nowrap">{daysLeft} {plural(daysLeft, 'день', 'дня', 'дней')}</b>{' '}
                — это <b className="u-num u-nowrap">{formatMoney(perDay as Minor, currency)}</b> в день.
              </>
            )}
          </p>

          <div
            className={styles.gauge}
            role="img"
            aria-label={`Израсходовано ${Math.round(spentRatio * 100)} процентов бюджета, прошло ${daysPassed} из ${daysInMonth} дней`}
          >
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ ['--f' as string]: Math.min(spentRatio, 1) }}
                data-over={spentRatio > 1 || undefined}
              />
              <div className={styles.today} style={{ left: `${timeRatio * 100}%` }} />
            </div>
            <div className={styles.legend}>
              <span>{Math.round(spentRatio * 100)}% БЮДЖЕТА</span>
              <span>{daysPassed} ИЗ {daysInMonth} ДНЯ</span>
            </div>
          </div>
        </>
      )}

      {!hasBudget && (
        <p className={styles.sub}>
          Бюджет на месяц не задан — поэтому «осталось» считается от нуля.{' '}
          <b>Задайте его</b>, и стена начнёт показывать, где вы относительно плана.
        </p>
      )}
    </section>
  );
}