type DateBadgeProperties = {
  date: string | Date;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white' | 'contour';
  /** Fill of the contour variant, in the logo colors; text stays readable on each. */
  tone?: 'orange' | 'pink' | 'green';
  /** What goes under the day: the month (default) or the weekday, when a month heading already says the month. */
  label?: 'month' | 'weekday';
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
  contour: 'contour-sm rounded-chip',
};

const toneStyles = {
  orange: 'bg-logo-orange text-black',
  pink: 'bg-primary text-white',
  green: 'bg-logo-green text-black',
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
  const weekday = d.toLocaleDateString('nl-BE', {weekday: 'short'}).replace('.', '').toUpperCase();
  return {day, month, weekday};
}

function DateBadge({
  date,
  size = 'md',
  variant = 'primary',
  tone = 'orange',
  label = 'month',
  className = '',
}: Readonly<DateBadgeProperties>) {
  const {day, month, weekday} = formatDateParts(date);
  const styles = sizeStyles[size];
  const isContour = variant === 'contour';
  const radius = isContour ? '' : styles.radius;
  const fill = isContour ? toneStyles[tone] : '';
  // The contour badge sets its day in the display face, extra bold instead of bold
  const dayClass = isContour ? styles.day.replace('font-bold', 'font-display font-extrabold') : styles.day;

  return (
    <div className={`flex-shrink-0 ${styles.container} ${radius} ${variantStyles[variant]} ${fill} flex flex-col items-center justify-center ${className}`}>
      <span className={dayClass}>{day}</span>
      <span className={`${styles.month} ${isContour ? 'font-bold' : ''}`}>{label === 'weekday' ? weekday : month}</span>
    </div>
  );
}

export {DateBadge, formatDateParts};
export type {DateBadgeProperties};
