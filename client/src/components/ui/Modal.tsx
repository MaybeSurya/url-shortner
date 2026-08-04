import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropVariants, scaleIn } from '../../lib/motion';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}) => {
  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              className={clsx(
                'relative w-full pointer-events-auto',
                'bg-surface-container-lowest border-t sm:border border-outline-variant rounded-t-2xl sm:rounded-xl shadow-xl',
                'max-h-[90vh] overflow-y-auto card-etched',
                sizes[size]
              )}
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden w-12 h-1 bg-outline-variant rounded-full mx-auto mt-2.5 mb-1" />

              {/* Header */}
              {(title || description) && (
                <div className="px-5 pt-5 pb-4 border-b border-outline-variant">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {title && (
                        <h2 id="modal-title" className="text-sm font-semibold text-on-surface">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p className="text-xs text-on-surface-variant mt-1">{description}</p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="px-5 py-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
