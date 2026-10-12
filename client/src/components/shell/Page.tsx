import type { ReactNode } from 'react';
import styles from './Page.module.css';

interface PageProps {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function Page({ title, sub, action, children }: PageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>{title}</h1>
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Section({ title, count, children }: { title: string; count?: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {count && <span className={styles.sectionCount}>{count}</span>}
      </div>
      {children}
    </section>
  );
}

export function PosterGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}