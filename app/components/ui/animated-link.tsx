'use client';

import type {ReactNode} from 'react';
import {ArrowRight, ArrowLeft} from 'lucide-react';

// CSS for link arrow animations
const linkStyles = `
	.animated-link {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animated-link-arrow {
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animated-link:hover .animated-link-arrow {
		transform: translateX(3px);
	}
`;

type AnimatedLinkProperties = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'white' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  arrowDirection?: 'right' | 'left';
  className?: string;
  external?: boolean;
};

const variantStyles = {
  primary: 'text-primary hover:underline',
  secondary: 'text-secondary hover:underline',
  white: 'text-white hover:text-white/80',
  muted: 'text-gray-500 hover:text-primary',
};

const sizeStyles = {
  sm: 'text-sm gap-1',
  md: 'text-base gap-2',
  lg: 'text-lg gap-2',
};

const arrowSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-5 w-5',
};

function AnimatedLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  showArrow = true,
  arrowDirection = 'right',
  className = '',
  external = false,
}: Readonly<AnimatedLinkProperties>) {
  const rightArrow = <ArrowRight className={`animated-link-arrow ${arrowSizes[size]} flex-shrink-0`} aria-hidden='true' />;
  const leftArrow = <ArrowLeft className={`animated-link-arrow ${arrowSizes[size]} flex-shrink-0`} aria-hidden='true' />;

  const arrow = arrowDirection === 'left' ? leftArrow : rightArrow;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: linkStyles}} />
      <a
        href={href}
        className={`animated-link inline-flex items-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
      >
        {arrowDirection === 'left' && showArrow && arrow}
        {children}
        {arrowDirection === 'right' && showArrow && arrow}
      </a>
    </>
  );
}

export {AnimatedLink, linkStyles};
export type {AnimatedLinkProperties};
