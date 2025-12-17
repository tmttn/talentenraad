'use client';

import type {ReactNode} from 'react';
import {ArrowRight} from 'lucide-react';

// CSS for button arrow animations
const buttonStyles = `
	.animated-button {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animated-button-arrow {
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animated-button:hover .animated-button-arrow {
		transform: translateX(4px);
	}
`;

type AnimatedButtonProperties = {
	href?: string;
	children: ReactNode;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	showArrow?: boolean;
	fullWidth?: boolean;
	className?: string;
	type?: 'button' | 'submit';
	disabled?: boolean;
	onClick?: () => void;
};

const variantStyles = {
	primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 focus:ring-primary',
	secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 focus:ring-white',
	outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
	ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
};

const sizeStyles = {
	sm: 'py-2 px-4 text-sm gap-2',
	md: 'py-3 px-6 text-base gap-2',
	lg: 'py-4 px-8 text-lg gap-3',
};

const arrowSizes = {
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-5 w-5',
};

function AnimatedButton({
	href,
	children,
	variant = 'primary',
	size = 'md',
	showArrow = true,
	fullWidth = false,
	className = '',
	type = 'button',
	disabled = false,
	onClick,
}: Readonly<AnimatedButtonProperties>) {
	const arrow = <ArrowRight className={`animated-button-arrow ${arrowSizes[size]} flex-shrink-0`} aria-hidden='true' />;

	const baseClasses = `animated-button inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

	if (href) {
		return (
			<>
				<style dangerouslySetInnerHTML={{__html: buttonStyles}} />
				<a href={href} className={baseClasses}>
					{children}
					{showArrow && arrow}
				</a>
			</>
		);
	}

	return (
		<>
			<style dangerouslySetInnerHTML={{__html: buttonStyles}} />
			<button type={type} className={baseClasses} disabled={disabled} onClick={onClick}>
				{children}
				{showArrow && arrow}
			</button>
		</>
	);
}

export {AnimatedButton, buttonStyles};
export type {AnimatedButtonProperties};
