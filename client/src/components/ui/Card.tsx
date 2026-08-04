import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable,
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border border-outline-variant bg-surface-container-lowest',
        'shadow-xs',
        paddingMap[padding],
        hoverable &&
          'cursor-pointer transition-shadow duration-200 hover:shadow-sm hover:border-outline',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  direction = 'row',
  className,
  ...props
}) => (
  <div
    className={clsx(
      'flex',
      direction === 'row' ? 'items-center justify-between gap-4 mb-4' : 'flex-col space-y-1 mb-4',
      className
    )}
    {...props}
  />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={clsx('text-sm font-semibold text-on-surface tracking-tight', className)}
    {...props}
  />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={clsx('text-xs text-on-surface-variant', className)} {...props} />
);
