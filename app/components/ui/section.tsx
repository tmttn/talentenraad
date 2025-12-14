import type {ReactNode} from 'react';

type SectionProperties = {
	children: ReactNode;
	title?: string;
	subtitle?: string;
	titleId?: string;
	variant?: 'default' | 'gray' | 'dark';
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	centerTitle?: boolean;
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
	title,
	subtitle,
	titleId,
	variant = 'default',
	size = 'lg',
	className = '',
	centerTitle = true,
}: Readonly<SectionProperties>) {
	const id = titleId ?? (title ? `section-${title.toLowerCase().replaceAll(/\s+/g, '-')}` : undefined);

	return (
		<section
			className={`${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
			aria-labelledby={id}
		>
			<div className={`${maxWidthStyles[size]} mx-auto`}>
				{(title || subtitle) && (
					<div className={`mb-10 ${centerTitle ? 'text-center' : ''}`}>
						{title && (
							<h2
								id={id}
								className={`text-2xl md:text-3xl font-bold mb-3 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}
							>
								{title}
							</h2>
						)}
						{subtitle && (
							<p className={variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
								{subtitle}
							</p>
						)}
					</div>
				)}
				{children}
			</div>
		</section>
	);
}

export {Section};
export type {SectionProperties};
