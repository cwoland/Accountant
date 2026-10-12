import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface Base {
  label: string;
  error?: string | undefined;
  hint?: string;

  suffix?: ReactNode;
}

type InputProps = Base & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, error, hint, suffix, className, ...rest }: InputProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.box} data-invalid={error ? 'true' : undefined}>
        <input
          id={id}
          {...rest}
          className={className ? `${styles.input} ${className}` : styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <p className={styles.err} id={`${id}-err`} role="alert">{error}</p>}
      {hint && !error && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

interface Opt { value: string; label: string; }
type SelectProps = Base & SelectHTMLAttributes<HTMLSelectElement> & { options: Opt[] };

export function SelectField({ label, error, hint, options, className, ...rest }: SelectProps) {
  const id = useId();
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.box} data-invalid={error ? 'true' : undefined}>
        <select id={id} {...rest} className={`${styles.input} ${styles.select}`} aria-invalid={error ? true : undefined}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {error && <p className={styles.err} role="alert">{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
