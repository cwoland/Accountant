import { INKS } from '@accountant/shared';

export function inkVar(index: number | null | undefined): string {
    if (index === null || index === undefined) return 'var(--ink-10)';

    const i = ((index % INKS.length) + INKS.length) % INKS.length;
    return `var(--ink-${i})`;
}

export function inkStyle(index: number | null | undefined): React.CSSProperties {
    return { ['--ink' as string]: inkVar(index) };
}