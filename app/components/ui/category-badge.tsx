type CategoryBadgeProperties = {
  category: string;
  size?: 'xs' | 'sm' | 'md';
  /** `outline`: transparent pill with a border in the current text color, for use on colored card headers. */
  variant?: 'filled' | 'outline';
  className?: string;
};

const categoryStyles: Record<string, string> = {
  feest: 'bg-category-event-bg text-category-event-text',
  kalender: 'bg-category-calendar-bg text-category-calendar-text',
  activiteit: 'bg-category-activity-bg text-category-activity-text',
  nieuws: 'bg-category-news-bg text-category-news-text',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

function CategoryBadge({
  category,
  size = 'sm',
  variant = 'filled',
  className = '',
}: Readonly<CategoryBadgeProperties>) {
  const style = variant === 'outline'
    ? 'font-bold border-2 border-current'
    : `font-medium ${categoryStyles[category.toLowerCase()] ?? categoryStyles.activiteit}`;

  return (
    <span className={`rounded-full ${style} ${sizeStyles[size]} ${className}`}>
      {category}
    </span>
  );
}

export {CategoryBadge, categoryStyles};
export type {CategoryBadgeProperties};
