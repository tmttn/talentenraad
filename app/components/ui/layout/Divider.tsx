type DividerOrientation = 'horizontal' | 'vertical';
type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';
type DividerColor = 'light' | 'default' | 'dark';

type DividerProps = {
  /** Orientation of the divider */
  orientation?: DividerOrientation;
  /** Spacing around the divider */
  spacing?: DividerSpacing;
  /** Color intensity */
  color?: DividerColor;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
};

const horizontalSpacingClasses: Record<DividerSpacing, string> = {
  none: '',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
};

const verticalSpacingClasses: Record<DividerSpacing, string> = {
  none: '',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-8',
};

const colorClasses: Record<DividerColor, string> = {
  light: 'border-gray-100',
  default: 'border-gray-200',
  dark: 'border-gray-300',
};

/**
 * Divider - Horizontal or vertical separator
 *
 * Usage:
 * <Divider spacing="md" />
 * <Divider orientation="vertical" spacing="sm" />
 */
export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  color = 'default',
  className = '',
  label,
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';

  const classes = [
    isHorizontal ? 'w-full border-t' : 'h-full border-l self-stretch',
    isHorizontal ? horizontalSpacingClasses[spacing] : verticalSpacingClasses[spacing],
    colorClasses[color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <hr
      className={classes}
      role={label ? 'separator' : 'presentation'}
      aria-orientation={orientation}
      aria-label={label}
    />
  );
}
