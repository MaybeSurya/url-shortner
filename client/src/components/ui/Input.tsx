import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      helperText,
      leftIcon,
      rightIcon,
      className,
      inputClassName,
      id,
      ...props
    },
    ref
  ) => {
    const activeHelper = helper || helperText;
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-on-surface-variant mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-on-surface-variant pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-8 text-sm text-on-surface placeholder:text-on-surface-variant/50',
              'bg-surface-container-lowest border rounded-md',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-error/60 focus:ring-error/20 focus:border-error/60'
                : 'border-outline-variant hover:border-outline',
              leftIcon ? 'pl-8' : 'pl-3',
              rightIcon ? 'pr-8' : 'pr-3',
              inputClassName
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-on-surface-variant">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.75 2.75a.75.75 0 011.5 0v2.5a.75.75 0 01-1.5 0v-2.5zM6 9a.875.875 0 110-1.75A.875.875 0 016 9z" />
            </svg>
            {error}
          </p>
        )}
        {activeHelper && !error && (
          <p className="mt-1 text-xs text-on-surface-variant">{activeHelper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
