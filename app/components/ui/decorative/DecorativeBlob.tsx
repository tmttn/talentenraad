type BlobPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
type BlobSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type BlobColor = 'white' | 'primary' | 'secondary' | 'accent' | 'gray';

type DecorativeBlobProps = {
  /** Position of the blob */
  position?: BlobPosition;
  /** Size of the blob */
  size?: BlobSize;
  /** Color of the blob */
  color?: BlobColor;
  /** Opacity (0-100) */
  opacity?: number;
  /** Blur amount */
  blur?: boolean;
  /** Additional CSS classes */
  className?: string;
};

const positionClasses: Record<BlobPosition, string> = {
  'top-left': '-top-20 -left-20',
  'top-right': '-top-20 -right-20',
  'bottom-left': '-bottom-20 -left-20',
  'bottom-right': '-bottom-20 -right-20',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeClasses: Record<BlobSize, string> = {
  sm: 'h-32 w-32',
  md: 'h-48 w-48',
  lg: 'h-64 w-64',
  xl: 'h-80 w-80',
  '2xl': 'h-96 w-96',
};

const colorClasses: Record<BlobColor, string> = {
  white: 'bg-white',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  gray: 'bg-gray-200',
};

/**
 * DecorativeBlob - Decorative circular element for backgrounds
 *
 * Usage:
 * <div className="relative overflow-hidden">
 *   <DecorativeBlob position="top-right" size="lg" color="white" opacity={10} />
 *   <Content />
 * </div>
 */
export function DecorativeBlob({
  position = 'top-right',
  size = 'lg',
  color = 'white',
  opacity = 10,
  blur = false,
  className = '',
}: DecorativeBlobProps) {
  const classes = [
    'absolute rounded-full pointer-events-none',
    positionClasses[position],
    sizeClasses[size],
    colorClasses[color],
    blur && 'blur-3xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Clamp opacity between 0 and 100
  const safeOpacity = Math.max(0, Math.min(100, opacity)) / 100;

  return <div className={classes} style={{opacity: safeOpacity}} aria-hidden='true' />;
}
