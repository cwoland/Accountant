import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** bone — глухая костяная плашка, единственное первичное действие на экране. */
  variant?: 'bone' | 'quiet' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'bone', size = 'md', loading = false, fullWidth = false,
  icon, children, disabled, className, ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      data-full={fullWidth || undefined}
      aria-busy={loading || undefined}
      className={className ? `${styles.btn} ${className}` : styles.btn}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : icon}
      {children}
    </button>
  );
}
