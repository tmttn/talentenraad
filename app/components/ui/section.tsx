import type {ReactNode} from 'react';

type SectionProperties = {
	children: ReactNode;
	variant?: 'default' | 'gray' | 'dark';
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
};

const variantStyles = {
	default: 'bg-white',
	gray: 'bg-gray-50',
	dark: 'bg-gray-900',
};

const sizeStyles = {
	sm: 'py-8 px-4',
	md: 'py-12 px-6',
	lg: 'py-16 px-6',
	xl: 'py-24 px-6',
};

const maxWidthStyles = {
	sm: 'max-w-3xl',
	md: 'max-w-4xl',
	lg: 'max-w-5xl',
	xl: 'max-w-6xl',
};

function Section({
	children,
	variant = 'default',
	size = 'lg',
	className = '',
}: Readonly<SectionProperties>) {
	return (
		<section
			className={`${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
		>
			<div className={`${maxWidthStyles[size]} mx-auto`}>
				{children}
			</div>
		</section>
	);
}

export {Section};
export type {SectionProperties};
