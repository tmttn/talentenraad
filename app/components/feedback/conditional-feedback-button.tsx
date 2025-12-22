'use client';

import {usePathname} from 'next/navigation';
import {FloatingFeedbackButton} from './floating-feedback-button';

// Pages where claps are shown (no feedback button needed)
const pagesWithClaps = [
	/^\/nieuws\/[^/]+$/,
	/^\/activiteiten\/[^/]+$/,
];

export function ConditionalFeedbackButton() {
	const pathname = usePathname();

	// Don't show feedback button on pages with claps
	const hasClaps = pagesWithClaps.some(pattern => pattern.test(pathname));
	if (hasClaps) {
		return null;
	}

	return <FloatingFeedbackButton />;
}
