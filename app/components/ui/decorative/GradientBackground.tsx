import type {ReactNode} from 'react';

type GradientVariant = 'primary' | 'secondary' | 'accent' | 'multi' | 'subtle';
type GradientDirection = 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';

type GradientBackgroundProps = {
  /** Gradient color variant */
  variant?: GradientVariant;
  /** Gradient direction */
  direction?: GradientDirection;
  /** Additional CSS classes */
  className?: string;
  /** Content to wrap */
  children: ReactNode;
  /** Render as a specific element */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer';
};

const variantClasses: Record<GradientVariant, string> = {
  primary: 'from-brand-primary-500 to-brand-primary-600',
  secondary: 'from-brand-secondary-400 to-brand-secondary-500',
  accent: 'from-brand-accent-400 to-brand-accent-500',
  multi: 'from-brand-primary-500 via-brand-accent-400 to-brand-secondary-400',
  subtle: 'from-gray-50 to-white',
};

const directionClasses: Record<GradientDirection, string> = {
  'to-r': 'bg-gradient-to-r',
  'to-l': 'bg-gradient-to-l',
  'to-t': 'bg-gradient-to-t',
  'to-b': 'bg-gradient-to-b',
  'to-br': 'bg-gradient-to-br',
  'to-bl': 'bg-gradient-to-bl',
  'to-tr': 'bg-gradient-to-tr',
  'to-tl': 'bg-gradient-to-tl',
};

/**
 * GradientBackground - Wrapper with gradient background
 *
 * Usage:
 * <GradientBackground variant="primary">
 *   <h2 className="text-white">Content on gradient</h2>
 * </GradientBackground>
 */
export function GradientBackground({
  variant = 'primary',
  direction = 'to-br',
  className = '',
  children,
  as: Component = 'div',
}: GradientBackgroundProps) {
  const classes = [directionClasses[direction], variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes}>{children}</Component>;
}
