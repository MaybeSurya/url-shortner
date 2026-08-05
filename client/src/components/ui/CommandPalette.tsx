import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Link as LinkIcon, BarChart3, Globe, Settings,
  ShieldCheck, Plus, Moon, Sun, Monitor, LogOut, LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { backdropVariants, scaleIn } from '../../lib/motion';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateLink?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateLink,
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAdmin, logout } = useAuth();

  // ⌘K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelected(0);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const navigate_to = useCallback((path: string) => {
    onClose();
    navigate(path);
  }, [navigate, onClose]);

  const groups = [
    {
      label: 'Navigation',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, action: () => navigate_to('/dashboard') },
        { id: 'links', label: 'Links', icon: <LinkIcon className="w-4 h-4" />, action: () => navigate_to('/links') },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate_to('/analytics') },
        { id: 'domains', label: 'Domains', icon: <Globe className="w-4 h-4" />, action: () => navigate_to('/domains') },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => navigate_to('/settings') },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4" />, action: () => navigate_to('/admin') }] : []),
      ],
    },
    {
      label: 'Actions',
      items: [
        {
          id: 'new-link',
          label: 'New Short Link',
          icon: <Plus className="w-4 h-4" />,
          action: () => { onClose(); onOpenCreateLink?.(); },
        },
        {
          id: 'theme',
          label: theme === 'dark' ? 'Switch to Light Mode' : theme === 'light' ? 'Switch to System' : 'Switch to Dark Mode',
          icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'light' ? <Monitor className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
          action: () => {
            const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
            setTheme(next);
            onClose();
          },
        },
        { id: 'logout', label: 'Sign out', icon: <LogOut className="w-4 h-4" />, action: () => { logout(); onClose(); } },
      ],
    },
  ];

  const filtered = groups.map(g => ({
    ...g,
    items: g.items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
  })).filter(g => g.items.length > 0);

  const allItems = filtered.flatMap(g => g.items);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(p => (p + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(p => (p - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        allItems[selected]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, allItems, selected, onClose]);

  let itemIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-10"
            role="dialog"
            aria-label="Command palette"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant">
              <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search commands…"
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                autoComplete="off"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant bg-surface-container border border-outline-variant rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto pb-2">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-xs text-on-surface-variant">
                  No results for "{query}"
                </div>
              ) : (
                filtered.map((group) => (
                  <div key={group.label}>
                    <p className="px-4 pt-3 pb-1 text-2xs font-semibold uppercase tracking-widest text-on-surface-variant/60">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const idx = itemIndex++;
                      const isSelected = idx === selected;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelected(idx)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isSelected ? 'text-primary' : 'text-on-surface-variant'}>
                              {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-primary/70" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-outline-variant bg-surface-container/50">
              <span className="text-2xs text-on-surface-variant flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="text-2xs text-on-surface-variant flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-surface-container border border-outline-variant rounded text-[9px] font-mono">↵</kbd>
                Select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
