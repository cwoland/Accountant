import type { ReactNode } from 'react';
import { INKS } from '@accountant/shared';
import LangSwitch from '@/components/ui/LangSwitch';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ title, footer, children }: {
  title: string; footer: ReactNode; children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <aside className={styles.wall} aria-hidden>
        <div className={styles.grid}>
          {INKS.map((ink, i) => (
            <span
              key={ink.id}
              className={styles.tile}
              style={{ ['--ink' as string]: ink.hex, ['--f' as string]: 0.25 + ((i * 7) % 10) / 13 }}
            />
          ))}
        </div>
        <p className={styles.claim}>
          Личные и общие деньги<br />на одной стене
        </p>
      </aside>

      <main className={styles.form}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{title}</h1>
          {children}
          <p className={styles.footer}>{footer}</p>
        </div>

        <LangSwitch />
      </main>
    </div>
  );
}
