import React from 'react';

interface MeupakatLogoProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export default function MeupakatLogo({
  className = 'text-[var(--color-primary)]',
  size = 28,
  strokeWidth = 2.2,
}: MeupakatLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5c0 4.5-4.5 8-9 8c-1.8 0-3.5-1-5-2L3 19.5l1.8-4.2C3.8 14 3.2 12.5 3.2 11.5c0-4.5 4.3-8.3 8.8-8.3c4.5 0 9 3.8 9 8.3z" />
      <path d="M8.5 14.5V9l3.5 3l3.5-3v5.5" />
    </svg>
  );
}
