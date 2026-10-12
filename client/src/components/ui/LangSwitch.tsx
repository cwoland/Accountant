import { useTranslation } from 'react-i18next';
import { LANGS, type Lang } from '../../i18n';
import styles from './LangSwitch.module.css';

export default function LangSwitch() {
  const { i18n } = useTranslation();
  const active = (i18n.resolvedLanguage ?? 'ru') as Lang;

  return (
    <div className={styles.wrap} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={active === l}
          className={styles.btn}
          onClick={() => {
            void i18n.changeLanguage(l);
            document.documentElement.lang = l;
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}