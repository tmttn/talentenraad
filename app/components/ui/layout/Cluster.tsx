import type {ReactNode} from 'react';

type ClusterGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ClusterAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type ClusterJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

type ClusterProps = {
  /** Gap between items */
  gap?: ClusterGap;
  /** Vertical alignment */
  align?: ClusterAlign;
  /** Horizontal distribution */
  justify?: ClusterJustify;
  /** Allow items to wrap */
  wrap?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cluster content */
  children: ReactNode;
  /** HTML element to render as */
  as?: 'div' | 'ul' | 'ol' | 'nav' | 'span';
};

const gapClasses: Record<ClusterGap, string> = {
  none: 'gap-0',
  xs: 'gap-1', // 4px
  sm: 'gap-2', // 8px
  md: 'gap-4', // 16px
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
};

const alignClasses: Record<ClusterAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const justifyClasses: Record<ClusterJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Cluster - Horizontal flex container with optional wrap
 *
 * Usage:
 * <Cluster gap="sm" align="center">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Cluster>
 */
export function Cluster({
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = true,
  className = '',
  children,
  as: Component = 'div',
}: ClusterProps) {
  const classes = [
    'flex',
    wrap && 'flex-wrap',
    gapClasses[gap],
    alignClasses[align],
    justifyClasses[justify],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes}>{children}</Component>;
}
