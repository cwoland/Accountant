import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, ListOrdered, MoreHorizontal, Plus, Target, X,
  type LucideIcon,
} from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import styles from './BottomNav.module.css';

interface NavItem { to: string; label: string; Icon: LucideIcon; end?: boolean }

const PRIMARY: NavItem[] = [
  { to: '/', label: 'Стена', Icon: LayoutGrid, end: true },
  { to: '/transactions', label: 'Операции', Icon: ListOrdered },
];

const SECONDARY = [
  { to: '/goals', label: 'Цели' },
  { to: '/debts', label: 'Долги' },
  { to: '/mandatory', label: 'Обязательные' },
  { to: '/accounts', label: 'Счета' },
  { to: '/ai', label: 'Советник' },
  { to: '/profile', label: 'Профиль' },
] as const;

export default function BottomNav() {
  const [more, setMore] = useState(false);
  const openCapture = useUiStore((s) => s.openCapture);
  const navigate = useNavigate();

  return (
    <>
      <nav className={styles.bar} aria-label="Основная навигация">
        {PRIMARY.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end ?? false} className={styles.item}>
            <Icon size={19} strokeWidth={2} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}

        <button type="button" className={styles.capture} onClick={() => openCapture('expense')}>
          <Plus size={22} strokeWidth={2.8} aria-hidden />
          <span className="u-sr">Записать трату</span>
        </button>

        <NavLink to="/goals" className={styles.item}>
          <Target size={19} strokeWidth={2} aria-hidden />
          <span>Цели</span>
        </NavLink>

        <button
          type="button"
          className={styles.item}
          aria-expanded={more}
          onClick={() => setMore(true)}
        >
          <MoreHorizontal size={19} strokeWidth={2} aria-hidden />
          <span>Ещё</span>
        </button>
      </nav>

      {more && (
        <div className={styles.scrim} onClick={(e) => { if (e.target === e.currentTarget) setMore(false); }}>
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Все разделы">
            <div className={styles.sheetHead}>
              <span>Все разделы</span>
              <button type="button" onClick={() => setMore(false)} aria-label="Закрыть" className={styles.close}>
                <X size={16} aria-hidden />
              </button>
            </div>
            <ul className={styles.list}>
              {SECONDARY.map(({ to, label }) => (
                <li key={to}>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => { setMore(false); navigate(to); }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
