import React from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Spinner = () => (
  <svg
    className="animate-spin w-3.5 h-3.5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white border border-transparent hover:bg-primary-hover shadow-xs active:scale-[0.97]',
  outline:
    'bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container hover:border-outline active:scale-[0.97]',
  ghost:
    'bg-transparent text-on-surface-variant border border-transparent hover:bg-surface-container hover:text-on-surface active:scale-[0.97]',
  danger:
    'bg-error text-white border border-transparent hover:bg-error/90 shadow-xs active:scale-[0.97]',
  secondary:
    'bg-secondary text-white border border-transparent hover:bg-secondary/90 shadow-xs active:scale-[0.97]',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-xs rounded gap-1',
  sm: 'h-7 px-2.5 text-xs rounded gap-1.5',
  md: 'h-8 px-3 text-sm rounded-md gap-2',
  lg: 'h-9 px-4 text-sm rounded-md gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'outline',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
