import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Rail.module.css';

interface RailProps {
    children: ReactNode;
    selectable?: boolean;
    label: string;
}

export default function Rail({ children, selectable = false, label }: RailProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: true, end: false });

    const measure = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        setEdges({
            start: el.scrollLeft < 8,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
        });
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        measure();
        el.addEventListener('scroll', measure, { passive: true });
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', measure);
            ro.disconnect();
        };
    }, [measure]);

    const nudge = (dir: 1 | -1) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const items = [...(ref.current?.querySelectorAll<HTMLElement>('button, a') ?? [])];
        const active = document.activeElement;
        const index = active instanceof HTMLElement ? items.indexOf(active) : -1;
        if (index === -1) return;
        e.preventDefault();
        const next = items[index + (e.key === 'ArrowRight' ? 1 : -1)];
        next?.focus();
    };

    return (
        <div className={styles.wrap}>
            <div
                ref={ref}
                className={styles.rail}
        role={selectable ? 'group' : undefined}
                aria-label={label}
                onKeyDown={onKeyDown}
            >
                {children}
            </div>

            <div className={styles.nav} data-idle={edges.start && edges.end ? 'true' : undefined} aria-hidden>
                <button type="button" tabIndex={-1} disabled={edges.start} onClick={() => nudge(-1)} aria-label="Назад">
                    <ChevronLeft size={13} strokeWidth={2.6} />
                </button>
                <button type="button" tabIndex={-1} disabled={edges.end} onClick={() => nudge(1)} aria-label="Вперед">
                    <ChevronRight size={13} strokeWidth={2.6} />
                </button>
            </div>
        </div>
    );
}