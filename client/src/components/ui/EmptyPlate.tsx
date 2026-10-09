import type { ReactNode } from 'react';
import styles from './EmptyPlate.module.css';

interface Props {
  icon: ReactNode;
  title: string;
  /** Что именно сделать, а не «здесь пока ничего нет». */
  description: string;
  action?: ReactNode;
}

export default function EmptyPlate({ icon, title, description, action }: Props) {
  return (
    <div className={styles.plate}>
      <div className={styles.mark} aria-hidden>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
