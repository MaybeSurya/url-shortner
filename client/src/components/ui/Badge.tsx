import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'indigo';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-surface-container text-on-surface-variant border-outline-variant',
  primary:  'bg-primary/10 text-primary border-primary/20',
  success:  'bg-secondary/10 text-secondary border-secondary/20',
  warning:  'bg-tertiary/10 text-tertiary border-tertiary/20',
  danger:   'bg-error/10 text-error border-error/20',
  indigo:   'bg-primary/10 text-primary border-primary/20',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1',
      'px-2 py-0.5 rounded text-2xs font-medium',
      'border',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
