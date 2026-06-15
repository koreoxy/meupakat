// src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'streak';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] transition-colors',
  secondary:
    'bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-active)] text-[var(--color-ink)] border border-[var(--color-hairline)] hover:border-[var(--color-ink-secondary)] transition-colors',
  ghost:
    'bg-transparent hover:bg-[var(--color-surface-active)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors',
  danger:
    'bg-[var(--color-error)] hover:bg-[var(--color-error-hover)] text-[var(--color-on-primary)] transition-colors',
  accent:
    'bg-[var(--color-surface-active)] hover:bg-[var(--color-primary)] text-[var(--color-ink)] hover:text-[var(--color-on-primary)] border border-[var(--color-hairline)] transition-colors',
  streak:
    'bg-[var(--color-orange)] hover:opacity-90 text-[var(--color-on-primary)] transition-opacity',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-[13px] font-medium leading-[1.25] rounded-[var(--radius-sm)] gap-1.5 h-8',
  md: 'px-5 py-2.5 text-[14px] font-medium leading-[1.25] rounded-[var(--radius-sm)] gap-2 h-10',
  lg: 'px-6 py-3 text-[14px] font-medium leading-[1.25] rounded-[var(--radius-sm)] gap-2 h-12',
  xl: 'px-8 py-4 text-[16px] font-medium leading-[1.25] rounded-[var(--radius-md)] gap-3 h-14',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200 cursor-pointer select-none ripple',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
