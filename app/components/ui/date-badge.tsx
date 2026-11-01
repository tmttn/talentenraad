type DateBadgeProperties = {
  date: string | Date;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white' | 'contour';
  className?: string;
};

/**
 * Size styles using design tokens
 * - Border radius: rounded-button (sm), rounded-card (md), rounded-modal (lg)
 * - Shadow: shadow-elevated (lg)
 */
const sizeStyles = {
  sm: {
    container: 'w-12 h-12',
    radius: 'rounded-button',
    day: 'text-lg font-bold leading-none',
    month: 'text-[9px] uppercase',
  },
  md: {
    container: 'w-16 h-16',
    radius: 'rounded-card',
    day: 'text-2xl font-bold leading-none',
    month: 'text-xs uppercase',
  },
  lg: {
    container: 'w-20 h-20',
    radius: 'rounded-modal shadow-elevated',
    day: 'text-3xl font-bold leading-none',
    month: 'text-sm uppercase',
  },
};

/**
 * Variant styles using design tokens
 * - Shadow: shadow-base (white variant)
 * - Contour: logo orange with a black outline and the display face
 */
const variantStyles = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  white: 'bg-white text-primary shadow-base',
  contour: 'bg-logo-orange text-black contour-sm rounded-chip',
};

/** Parses YYYY-MM-DD as a local date, so the day never shifts with the timezone. */
function toDate(date: string | Date) {
  if (typeof date !== 'string') {
    return date;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(date);
}

function formatDateParts(date: string | Date) {
  const d = toDate(date);
  const day = d.getDate();
  const month = d.toLocaleDateString('nl-BE', {month: 'short'}).replace('.', '').toUpperCase();
  return {day, month};
}

function DateBadge({
  date,
  size = 'md',
  variant = 'primary',
  className = '',
}: Readonly<DateBadgeProperties>) {
  const {day, month} = formatDateParts(date);
  const styles = sizeStyles[size];
  const isContour = variant === 'contour';
  const radius = isContour ? '' : styles.radius;
  // The contour badge sets its day in the display face, extra bold instead of bold
  const dayClass = isContour ? styles.day.replace('font-bold', 'font-display font-extrabold') : styles.day;

  return (
    <div className={`flex-shrink-0 ${styles.container} ${radius} ${variantStyles[variant]} flex flex-col items-center justify-center ${className}`}>
      <span className={dayClass}>{day}</span>
      <span className={`${styles.month} ${isContour ? 'font-bold' : ''}`}>{month}</span>
    </div>
  );
}

export {DateBadge, formatDateParts};
export type {DateBadgeProperties};
