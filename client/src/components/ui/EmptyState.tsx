import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { slideUp } from '../../lib/motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <motion.div
    variants={slideUp}
    initial="initial"
    animate="animate"
    className={clsx(
      'flex flex-col items-center justify-center text-center py-16 px-8',
      className
    )}
  >
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-sm font-semibold text-on-surface mb-1">{title}</h3>
    {description && (
      <p className="text-xs text-on-surface-variant max-w-xs mb-5">{description}</p>
    )}
    {action}
  </motion.div>
);
