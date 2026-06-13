import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, AlertCircle,
  ShoppingCart, Sparkles, User, LogOut, Wallet, Menu, X,
} from 'lucide-react';
import useStore from '../../store/useStore';
import toast from 'react-hot-toast';

const links = [
    { to: '/',             icon: <LayoutDashboard size={18} />, label: 'Обзор' },
    { to: '/transactions', icon: <ArrowLeftRight size={18} />,  label: 'Транзакции' },
    { to: '/mandatory',    icon: <AlertCircle size={18} />,     label: 'Обязательные' },
    { to: '/products',     icon: <ShoppingCart size={18} />,    label: 'Товары и услуги' },
    { to: '/ai',           icon: <Sparkles size={18} />,        label: 'Советник' },
];

function NavLinks({ onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из аккаунта');
    navigate('/login');
    onClose?.();
  };

  return (
    <>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--radius-m)',
              color: isActive ? 'var(--text-1)' : 'var(--text-3)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem', transition: 'var(--transition)',
              textDecoration: 'none', position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div layoutId="sidebar-active"
                  />
                )}
                <span style={{ color: isActive ? 'var(--accent-2)' : 'inherit' }}>{icon}</span>
                {label}
                {to === '/ai' && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.65rem',
                    background: 'var(--accent-dim)', color: 'var(--accent-2)',
                    padding: '2px 6px', borderRadius: 99,
                    fontWeight: 700, letterSpacing: '0.04em',
                  }}>AI</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLink to="/profile" onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 'var(--radius-m)',
            color: isActive ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.875rem', textDecoration: 'none', transition: 'var(--transition)',
          })}
        >
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-2)', flexShrink: 0,
          }}>
            {user?.avatar || user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </span>
        </NavLink>

        <button onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 'var(--radius-m)',
            color: 'var(--text-3)', fontSize: '0.875rem',
            transition: 'var(--transition)', width: '100%', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </>
  );
}

function DesktopSidebar() {
  return (
    <aside
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '24px 12px 20px',
        borderBottom: '1px solid var(--border)', marginBottom: 8,
      }}>
        <div style={{
          width: 34, height: 34, background: 'var(--accent)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)', flexShrink: 0,
        }}>
          <Wallet size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>
          Accountant
        </span>
      </div>
      <NavLinks />
    </aside>
  );
}

function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);


  return (
    <AnimatePresence>
      {open && (
        <>
          <div
          />
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 12px 16px',
              borderBottom: '1px solid var(--border)', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, background: 'var(--accent)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}>
                  <Wallet size={16} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em' }}>
                  Accountant
                </span>
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 'var(--radius-s)',
                background: 'var(--surface)', color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={16} />
              </button>
            </div>
            <NavLinks onClose={onClose} />
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function MobileTopBar({ onOpen }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', height: 'var(--header-h)',
      background: 'var(--bg)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, background: 'var(--accent)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <Wallet size={15} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em' }}>
          Accountant
        </span>
      </div>
      <button onClick={onOpen} style={{
        width: 36, height: 36, borderRadius: 'var(--radius-m)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <Menu size={18} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <>
        <MobileTopBar onOpen={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </>
    );
  }

  return <DesktopSidebar />;
}