import { NavLink } from 'react-router-dom';
import styles from './SideNav.module.css';

interface NavItem { to: string; label: string; end?: boolean }

const LINKS: NavItem[] = [
    { to: '/', label: 'Стена', end: true },
    { to: '/transactions', label: 'Операции' },
    { to: '/mandatory', label: 'Обязательные' },
    { to: '/goals', label: 'Цели' },
    { to: '/debts', label: 'Долги' },
    { to: '/ai', label: 'Советник' },
    { to: '/profile', label: 'Профиль' },
] as const;

export default function SideNav() {
    return (
        <nav className={styles.side} aria-label="Разделы">
            {LINKS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end ?? false} className={styles.item}>
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}