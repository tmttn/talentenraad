import type {ReactNode} from 'react';

type CardProperties = {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
};

/**
 * Card variant styles using design tokens
 * - Shadows: shadow-base, shadow-elevated, shadow-floating (from tokens)
 * - Transitions applied via hover prop
 */
const variantStyles = {
  default: 'bg-white shadow-base',
  elevated: 'bg-white shadow-elevated hover:shadow-floating',
  bordered: 'bg-white border border-gray-200',
  ghost: 'bg-gray-50',
};

/**
 * Card padding styles using design tokens
 * Maps to --spacing-component-* CSS variables
 */
const paddingStyles = {
  none: '',
  sm: 'p-component-sm',
  md: 'p-component-md',
  lg: 'p-component-lg',
};

function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
}: Readonly<CardProperties>) {
  const hoverStyles = hover
    ? 'hover:shadow-elevated transition-shadow duration-base'
    : '';

  return (
    <div
      className={`rounded-card ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}

export {Card};
export type {CardProperties};
