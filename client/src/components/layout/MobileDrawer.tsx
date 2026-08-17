import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Zap,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { backdropVariants, ease } from '../../lib/motion';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Links', to: '/links', icon: LinkIcon },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { siteName } = useConfig();
  const { theme, setTheme } = useTheme();
  const initial = user?.email?.charAt(0)?.toUpperCase() ?? 'U';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'] as const;
    const idx = themes.indexOf(theme as unknown as (typeof themes)[number]);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: ease.smooth }}
            className="relative w-4/5 max-w-xs bg-surface-container-lowest h-full shadow-2xl flex flex-col z-10 border-r border-outline-variant card-etched"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-on-surface">
                  {siteName}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Bar */}
            <div className="px-4 py-3.5 border-b border-outline-variant bg-surface-container-low/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {user?.email}
                </p>
                <span className="text-2xs text-on-surface-variant capitalize">
                  {user?.role ?? 'User'}
                </span>
              </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {DRAWER_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors mt-2',
                      isActive
                        ? 'bg-error/10 text-error font-semibold'
                        : 'text-on-surface-variant hover:text-error hover:bg-error/5'
                    )
                  }
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-error" />
                  <span>Admin Panel</span>
                </NavLink>
              )}
            </nav>

            {/* Footer controls */}
            <div className="p-3 border-t border-outline-variant space-y-2 bg-surface-container-low/20">
              <button
                onClick={cycleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  <span>Theme: <span className="capitalize">{theme}</span></span>
                </div>
              </button>

              <button
                onClick={() => { onClose(); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
