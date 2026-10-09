import { Plus, Camera } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import styles from './CaptureBar.module.css';

export default function CaptureBar() {
  const openCapture = useUiStore((s) => s.openCapture);

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.primary} onClick={() => openCapture('expense')}>
        <Plus size={18} strokeWidth={2.6} aria-hidden />
        Записать трату
      </button>
      <button
        type="button"
        className={styles.quiet}
        onClick={() => openCapture('receipt')}
        aria-label="Сфотографировать чек"
      >
        <Camera size={19} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}