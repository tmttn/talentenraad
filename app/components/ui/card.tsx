import type {ReactNode} from 'react';

type CardProperties = {
	children: ReactNode;
	variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	className?: string;
	hover?: boolean;
};

const variantStyles = {
	default: 'bg-white shadow-md',
	elevated: 'bg-white shadow-lg hover:shadow-xl',
	bordered: 'bg-white border border-gray-200',
	ghost: 'bg-gray-50',
};

const paddingStyles = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

function Card({
	children,
	variant = 'default',
	padding = 'md',
	className = '',
	hover = false,
}: Readonly<CardProperties>) {
	return (
		<div className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}>
			{children}
		</div>
	);
}

export {Card};
export type {CardProperties};
