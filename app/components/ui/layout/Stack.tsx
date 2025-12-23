import type {ReactNode, HTMLAttributes} from 'react';

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export type StackProps = {
  /** Gap between items */
  gap?: StackGap;
  /** Horizontal alignment */
  align?: StackAlign;
  /** Additional CSS classes */
  className?: string;
  /** Stack content */
  children: ReactNode;
  /** HTML element to render as */
  as?: 'div' | 'ul' | 'ol' | 'nav' | 'article' | 'section';
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

const gapClasses: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-1', // 4px
  sm: 'gap-2', // 8px
  md: 'gap-4', // 16px
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
};

const alignClasses: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * Stack - Vertical flex container
 *
 * Usage:
 * <Stack gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */
export function Stack({
  gap = 'md',
  align = 'stretch',
  className = '',
  children,
  as: Component = 'div',
  ...rest
}: StackProps) {
  const classes = ['flex flex-col', gapClasses[gap], alignClasses[align], className]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes} {...rest}>{children}</Component>;
}
