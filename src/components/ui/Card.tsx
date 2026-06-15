// src/components/ui/Card.tsx
import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'feature' | 'animation' | 'bordered' | 'glass' | 'surface';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles: Record<string, string> = {
  default:
    'bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-lg)]',
  feature:
    'bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)]',
  animation:
    'bg-[var(--color-surface-card)] border border-[var(--color-hairline)] rounded-[var(--radius-lg)] hover:border-[var(--color-primary)] hover:ring-1 hover:ring-[var(--color-primary)] transition-all duration-200 cursor-pointer',
  bordered:
    'bg-transparent border border-[var(--color-hairline)] rounded-[var(--radius-md)]',
  glass:
    'bg-[var(--color-surface-modal)] border border-[var(--color-hairline)] rounded-[var(--radius-xl)]',
  surface:
    'bg-[var(--color-surface-active)] rounded-[var(--radius-md)]',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden text-[var(--color-ink)]',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
