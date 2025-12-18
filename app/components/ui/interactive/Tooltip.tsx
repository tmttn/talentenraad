'use client';

import type {ReactNode} from 'react';
import {useState, useRef, useEffect} from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
	/** Tooltip content */
	content: string;
	/** Position of the tooltip */
	position?: TooltipPosition;
	/** Delay before showing (ms) */
	delay?: number;
	/** Trigger element */
	children: ReactNode;
	/** Additional CSS classes */
	className?: string;
};

const positionClasses: Record<TooltipPosition, string> = {
	top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
	bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
	left: 'right-full top-1/2 -translate-y-1/2 mr-2',
	right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
	top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
	bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
	left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
	right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
};

/**
 * Tooltip - Hover tooltip component
 *
 * Usage:
 * <Tooltip content="This is a tooltip">
 *   <button>Hover me</button>
 * </Tooltip>
 */
export function Tooltip({
	content,
	position = 'top',
	delay = 200,
	children,
	className = '',
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const showTooltip = () => {
		timeoutRef.current = setTimeout(() => {
			setIsVisible(true);
		}, delay);
	};

	const hideTooltip = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setIsVisible(false);
	};

	// Cleanup timeout on unmount
	useEffect(() => () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	}, []);

	return (
		<div
			className={`relative inline-block ${className}`}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
			onFocus={showTooltip}
			onBlur={hideTooltip}
		>
			{children}

			{isVisible && (
				<div
					role="tooltip"
					className={[
						'absolute z-50 whitespace-nowrap rounded-tooltip px-2 py-1',
						'bg-gray-900 text-xs text-white',
						'animate-in fade-in zoom-in-95 duration-fast',
						positionClasses[position],
					]
						.filter(Boolean)
						.join(' ')}
				>
					{content}
					{/* Arrow */}
					<div
						className={[
							'absolute border-4',
							arrowClasses[position],
						]
							.filter(Boolean)
							.join(' ')}
						aria-hidden="true"
					/>
				</div>
			)}
		</div>
	);
}
