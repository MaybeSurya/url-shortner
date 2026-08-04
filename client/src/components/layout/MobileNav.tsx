import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  QrCode,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  onOpenCreateLink: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCreateLink }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant px-2 py-1.5 flex items-center justify-around card-etched pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      {/* 1. Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-[10px] font-medium transition-colors',
            isActive
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          )
        }
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span>Dashboard</span>
      </NavLink>

      {/* 2. Links */}
      <NavLink
        to="/links"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-[10px] font-medium transition-colors',
            isActive
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          )
        }
      >
        <LinkIcon className="w-4 h-4 mb-0.5" />
        <span>Links</span>
      </NavLink>

      {/* 3. Analytics */}
      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-[10px] font-medium transition-colors',
            isActive
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          )
        }
      >
        <BarChart3 className="w-4 h-4 mb-0.5" />
        <span>Analytics</span>
      </NavLink>

      {/* 4. QR Code Action */}
      <button
        onClick={onOpenCreateLink}
        className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-[10px] font-medium text-primary active:scale-95 transition-transform"
        aria-label="Generate QR Code"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-sm mb-0.5">
          <QrCode className="w-3.5 h-3.5" />
        </div>
        <span>QR Code</span>
      </button>

      {/* 5. Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          clsx(
            'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 rounded-lg text-[10px] font-medium transition-colors',
            isActive
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          )
        }
      >
        <Settings className="w-4 h-4 mb-0.5" />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};
