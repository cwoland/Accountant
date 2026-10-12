import styles from './WallSkeleton.module.css';

export default function WallSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-live="polite">
      <span className="u-sr">Загружаем стену</span>

      <div className={styles.rail} aria-hidden>
        {[0, 1, 2].map((i) => <div key={i} className={styles.spine} />)}
      </div>

      <div className={styles.hero} aria-hidden>
        <div className={styles.line} style={{ width: '38%', height: 11 }} />
        <div className={styles.line} style={{ width: '62%', height: 52, marginTop: 12 }} />
        <div className={styles.line} style={{ width: '48%', height: 28, marginTop: 16 }} />
      </div>

      <div className={styles.rail} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={styles.tile} />)}
      </div>
    </div>
  );
}
