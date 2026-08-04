import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded, ...props }) => (
  <div
    aria-hidden="true"
    className={clsx(
      'skeleton-shimmer',
      rounded ? 'rounded-full' : 'rounded-md',
      className
    )}
    {...props}
  />
);
