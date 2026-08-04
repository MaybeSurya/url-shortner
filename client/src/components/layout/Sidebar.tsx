import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Globe,
  Settings,
  ShieldCheck,
  Plus,
  LogOut,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { sidebarVariants, ease } from '../../lib/motion';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateLink: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, shortcut: '1' },
  { label: 'Links', to: '/links', icon: LinkIcon, shortcut: '2' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, shortcut: '3' },
  { label: 'Custom Domains', to: '/domains', icon: Globe, shortcut: '4' },
  { label: 'Settings', to: '/settings', icon: Settings, shortcut: '5' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenCreateLink,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { siteName } = useConfig();
  const initial = user?.email?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      initial={false}
      className={clsx(
        'hidden md:flex flex-col fixed top-0 left-0 bottom-0 h-screen z-30',
        'bg-surface-container-lowest border-r border-outline-variant',
        'select-none overflow-hidden card-etched'
      )}
    >
      {/* ── Top: Brand ── */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.1 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-on-surface leading-none">
                  {siteName}
                </p>
                <p className="text-2xs text-on-surface-variant mt-0.5 font-mono tracking-wider uppercase">
                  {user?.role ?? 'Free'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center mx-auto shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        {!isCollapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onToggleCollapse}
            className="w-6 h-6 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* ── Create Link CTA Button ── */}
      <div className="px-2.5 pb-4 shrink-0">
        <button
          onClick={onOpenCreateLink}
          className={clsx(
            'w-full flex items-center rounded-lg',
            'bg-primary text-white font-medium text-xs shadow-xs',
            'transition-all duration-150 hover:bg-primary-hover active:scale-[0.97]',
            isCollapsed ? 'h-9 justify-center' : 'h-9 gap-2 px-3',
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.1 } }}
                exit={{ opacity: 0, width: 0, transition: { duration: 0.1 } }}
                className="whitespace-nowrap overflow-hidden"
              >
                Create New Link
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3">
        {!isCollapsed && (
          <p className="px-3 text-2xs font-semibold uppercase tracking-widest text-on-surface-variant/60 mb-2 mt-1">
            Workspace
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center rounded-lg text-xs font-medium',
                  'transition-all duration-150',
                  isCollapsed ? 'h-9 w-full justify-center' : 'h-9 gap-3 px-3',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      style={{ zIndex: -1 }}
                      transition={{ duration: 0.25, ease: ease.smooth }}
                    />
                  )}

                  <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-primary' : '')} />

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.08 } }}
                        exit={{ opacity: 0, transition: { duration: 0.08 } }}
                        className="whitespace-nowrap overflow-hidden flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && (
                    <span className="opacity-0 group-hover:opacity-40 text-2xs font-mono transition-opacity">
                      ⌘{item.shortcut}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink
            to="/admin"
            title={isCollapsed ? 'Admin' : undefined}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center rounded-lg text-xs font-medium mt-1',
                'transition-all duration-150',
                isCollapsed ? 'h-9 w-full justify-center' : 'h-9 gap-3 px-3',
                isActive
                  ? 'bg-error/10 text-error font-semibold'
                  : 'text-on-surface-variant hover:text-error/80 hover:bg-error/5'
              )
            }
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.08 } }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  className="whitespace-nowrap overflow-hidden flex-1"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-outline-variant px-2.5 py-3 space-y-1">
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors mb-1"
            title="Expand sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}

        <div
          className={clsx(
            'flex items-center rounded-lg transition-colors cursor-default',
            isCollapsed ? 'justify-center p-1.5' : 'gap-2.5 px-2.5 py-1.5'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary shrink-0">
            {initial}
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.08 } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-on-surface truncate leading-none">
                  {user?.email}
                </p>
                <p className="text-2xs text-on-surface-variant mt-0.5 capitalize">
                  {(user?.role ?? 'user').toLowerCase()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button
              onClick={() => logout()}
              className="w-6 h-6 flex items-center justify-center rounded-md text-on-surface-variant/60 hover:text-error hover:bg-error/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
