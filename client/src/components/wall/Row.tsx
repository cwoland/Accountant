import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './Row.module.css';

interface RowProps {
  title: string;
  count?: string;
  allHref?: string;
  children: ReactNode;
}

export default function Row({ title, count, allHref, children }: RowProps) {
  const id = `row-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section className={styles.row} aria-labelledby={id}>
      <header className={styles.head}>
        <h2 className={styles.title} id={id}>{title}</h2>
        {count && <span className={styles.count}>{count}</span>}
        {allHref && (
          <Link className={styles.all} to={allHref}>
            Все <ChevronRight size={13} strokeWidth={2.6} aria-hidden />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}