type DateBadgeProperties = {
	date: string | Date;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'primary' | 'secondary' | 'white';
	className?: string;
};

const sizeStyles = {
	sm: {
		container: 'w-12 h-12 rounded-lg',
		day: 'text-lg font-bold leading-none',
		month: 'text-[9px] uppercase',
	},
	md: {
		container: 'w-16 h-16 rounded-xl',
		day: 'text-2xl font-bold leading-none',
		month: 'text-xs uppercase',
	},
	lg: {
		container: 'w-20 h-20 rounded-2xl shadow-lg',
		day: 'text-3xl font-bold leading-none',
		month: 'text-sm uppercase',
	},
};

const variantStyles = {
	primary: 'bg-primary text-white',
	secondary: 'bg-secondary text-white',
	white: 'bg-white text-primary shadow-md',
};

function formatDateParts(date: string | Date) {
	const d = typeof date === 'string' ? new Date(date) : date;
	const day = d.getDate();
	const month = d.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
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

	return (
		<div className={`flex-shrink-0 ${styles.container} ${variantStyles[variant]} flex flex-col items-center justify-center ${className}`}>
			<span className={styles.day}>{day}</span>
			<span className={styles.month}>{month}</span>
		</div>
	);
}

export {DateBadge, formatDateParts};
export type {DateBadgeProperties};
