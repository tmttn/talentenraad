import type {ReactNode, HTMLAttributes} from 'react';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6;
type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type GridProps = {
  /** Default columns (mobile) */
  cols?: GridCols;
  /** Columns at sm breakpoint (640px) */
  colsSm?: GridCols;
  /** Columns at md breakpoint (768px) */
  colsMd?: GridCols;
  /** Columns at lg breakpoint (1024px) */
  colsLg?: GridCols;
  /** Columns at xl breakpoint (1280px) */
  colsXl?: GridCols;
  /** Gap between items */
  gap?: GridGap;
  /** Additional CSS classes */
  className?: string;
  /** Grid content */
  children: ReactNode;
  /** HTML element to render as */
  as?: 'div' | 'ul' | 'ol' | 'section';
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

const colClasses: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const colSmClasses: Record<GridCols, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
};

const colMdClasses: Record<GridCols, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

const colLgClasses: Record<GridCols, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

const colXlClasses: Record<GridCols, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
};

const gapClasses: Record<GridGap, string> = {
  none: 'gap-0',
  sm: 'gap-4', // 16px
  md: 'gap-6', // 24px
  lg: 'gap-8', // 32px
  xl: 'gap-12', // 48px
};

/**
 * Grid - Responsive grid system
 *
 * Usage:
 * <Grid cols={1} colsMd={2} colsLg={3} gap="md">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 */
export function Grid({
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap = 'md',
  className = '',
  children,
  as: Component = 'div',
  ...rest
}: GridProps) {
  const classes = [
    'grid',
    colClasses[cols],
    colsSm && colSmClasses[colsSm],
    colsMd && colMdClasses[colsMd],
    colsLg && colLgClasses[colsLg],
    colsXl && colXlClasses[colsXl],
    gapClasses[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes} {...rest}>{children}</Component>;
}
