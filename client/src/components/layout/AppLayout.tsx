import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '../ui/CommandPalette';
import { CreateLinkModal } from '../../features/links/CreateLinkModal';
import { MobileNav } from './MobileNav';
import { MobileDrawer } from './MobileDrawer';
import { Toaster } from 'sonner';
import { pageVariants } from '../../lib/motion';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col relative">
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
          },
        }}
      />

      {/* Sidebar: Fixed position on desktop */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(c => !c)}
        onOpenCreateLink={() => setIsCreateLinkOpen(true)}
      />

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-smooth ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {/* Sticky Header */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCreateLink={() => setIsCreateLinkOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* Page Content: Native window scrolling */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenCreateLink={() => setIsCreateLinkOpen(true)} />

      {/* Mobile Slide-Out Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCreateLink={() => setIsCreateLinkOpen(true)}
      />

      {/* Create Short Link Centered Modal */}
      <CreateLinkModal
        isOpen={isCreateLinkOpen}
        onClose={() => setIsCreateLinkOpen(false)}
      />
    </div>
  );
};
