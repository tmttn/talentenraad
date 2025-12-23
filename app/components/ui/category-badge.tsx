type CategoryBadgeProperties = {
  category: string;
  size?: 'xs' | 'sm' | 'md';
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
  className = '',
}: Readonly<CategoryBadgeProperties>) {
  const style = categoryStyles[category.toLowerCase()] ?? categoryStyles.activiteit;

  return (
    <span className={`font-medium rounded-full ${style} ${sizeStyles[size]} ${className}`}>
      {category}
    </span>
  );
}

export {CategoryBadge, categoryStyles};
export type {CategoryBadgeProperties};
