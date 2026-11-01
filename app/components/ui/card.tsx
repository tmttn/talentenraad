import type {ReactNode} from 'react';
import Link from 'next/link';

type CardProperties = {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost' | 'contour' | 'contour-lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
  /** Renders the card as a link; the whole card becomes clickable. */
  href?: string;
};

/**
 * Card variant styles using design tokens
 * - Shadows: shadow-base, shadow-elevated, shadow-floating (from tokens)
 * - Contour: black outline (contour-sm / contour) with a hard offset shadow (shadow-hard-*)
 * - Transitions applied via hover prop
 */
const variantStyles = {
  default: 'rounded-card bg-white shadow-base',
  elevated: 'rounded-card bg-white shadow-elevated hover:shadow-floating',
  bordered: 'rounded-card bg-white border border-gray-200',
  ghost: 'rounded-card bg-gray-50',
  contour: 'rounded-tile bg-white contour-sm shadow-hard-md overflow-hidden',
  'contour-lg': 'rounded-panel bg-white contour shadow-hard-lg overflow-hidden',
};

const hoverStyles = {
  default: 'hover:shadow-elevated transition-shadow duration-base',
  contour: 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg transition duration-base',
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
  href,
}: Readonly<CardProperties>) {
  const isContour = variant === 'contour' || variant === 'contour-lg';
  const hoverClass = hover ? hoverStyles[isContour ? 'contour' : 'default'] : '';
  const classes = `${variantStyles[variant]} ${paddingStyles[padding]} ${hoverClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${classes}`}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export {Card};
export type {CardProperties};
