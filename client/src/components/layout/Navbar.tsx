import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Monitor, Plus, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenCreateLink: () => void;
  onOpenMobileDrawer?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/links': 'Links',
  '/analytics': 'Analytics',
  '/domains': 'Domains',
  '/settings': 'Settings',
  '/admin': 'Admin',
};

const ThemeIcon = ({ theme }: { theme: string }) => {
  if (theme === 'light') return <Sun className="w-4 h-4" />;
  if (theme === 'dark') return <Moon className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenCreateLink,
  onOpenMobileDrawer,
}) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Workspace';

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'] as const;
    const idx = themes.indexOf(theme as 'system' | 'light' | 'dark');
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 sm:px-5 border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-sm z-10">
      {/* Left: Hamburger menu + page title */}
      <div className="flex items-center gap-2.5">
        {onOpenMobileDrawer && (
          <button
            onClick={onOpenMobileDrawer}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-semibold text-on-surface tracking-tight">
          {pageTitle}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Search / command palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 h-7 px-2.5 rounded-md border border-outline-variant bg-surface-container text-on-surface-variant text-xs transition-colors hover:bg-surface-container-high hover:text-on-surface group"
        >
          <Search className="w-3 h-3" />
          <span>Search</span>
          <kbd className="ml-1 text-[10px] font-mono text-on-surface-variant/60 bg-surface-container-highest px-1 py-0.5 rounded border border-outline-variant group-hover:border-outline">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-outline-variant mx-1" />

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon theme={theme} />
        </button>

        {/* Create link */}
        <button
          onClick={onOpenCreateLink}
          className="ml-1 flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-primary text-white text-xs font-medium transition-all hover:bg-primary-hover active:scale-[0.97]"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </header>
  );
};
