import type { CSSProperties, ReactNode } from "react";
import { inkVar } from '../../lib/ink.ts';
import styles from './Poster.module.css';

export type PosterShape = 'tile' | 'spine' | 'wide';

export interface PosterProps {
    ink: number;
    ratio?: number;
    shape?: PosterShape;
    icon?: ReactNode;
    title: string;
    amount?: string;
    meta?: string;
    flag?: string;
    flagAlert?: boolean;
    current?: boolean;
    dimWhenNotCurrent?: boolean;
    onClick?: () => void;
    ariaLabel?: string;
}

export default function Poster({
    ink,
    ratio = 0,
    shape = 'tile',
    icon,
    title,
    amount,
    meta,
    flag,
    flagAlert = false,
    current = false,
    dimWhenNotCurrent = false,
    onClick,
    ariaLabel,
}: PosterProps) {
    const f = Math.max(0, Math.min(ratio, 1));

    const style = {
        '--ink': inkVar(ink),
        '--f': f,
    } as CSSProperties;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={current ? 'true' : undefined}
            aria-label={ariaLabel}
            data-shape={shape}
            data-dim={dimWhenNotCurrent && !current ? 'true' : undefined}
            className={styles.poster}
            style={style}
        >
            <span className={styles.ground} aria-hidden />
            <span className={styles.fill} aria-hidden />

            {flag && (
                <span className={flagAlert ? `${styles.flag} ${styles.flagAlert}` : styles.flag}>
                    {flag}
                </span>
            )}

            <span className={styles.body}>
                {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
                <span className={styles.title}>{title}</span>
                {amount && <span className={styles.amount}>{amount}</span>}
                {meta && <span className={styles.meta}>{meta}</span>}
            </span>
        </button>
    );
}