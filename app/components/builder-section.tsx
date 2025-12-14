'use client';

import {useEffect, useState} from 'react';
import {Content, fetchOneEntry, type BuilderContent} from '@builder.io/sdk-react-nextjs';
// eslint-disable-next-line import-x/extensions
import {HeroInfo} from './hero';
// eslint-disable-next-line import-x/extensions
import {CTABannerInfo} from './cta-banner';
// eslint-disable-next-line import-x/extensions
import {InfoCardInfo} from './info-card';
// eslint-disable-next-line import-x/extensions
import {SectionInfo} from './section';
// eslint-disable-next-line import-x/extensions
import {FAQInfo} from './faq';
// eslint-disable-next-line import-x/extensions
import {ActiviteitenListInfo} from './activiteiten-list';
// eslint-disable-next-line import-x/extensions
import {NieuwsListInfo} from './nieuws-list';
// eslint-disable-next-line import-x/extensions
import {DecorationInfo, DividerInfo} from './decorations';

// eslint-disable-next-line n/prefer-global/process
const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

const customComponents = [
	HeroInfo,
	CTABannerInfo,
	InfoCardInfo,
	SectionInfo,
	FAQInfo,
	ActiviteitenListInfo,
	NieuwsListInfo,
	DecorationInfo,
	DividerInfo,
];

type BuilderSectionProperties = {
	model: string;
	url?: string;
};

/**
 * BuilderSection component fetches and renders a section from Builder.io
 * This is a Client Component that fetches sections on the client side.
 * Use this for reusable sections like announcement bars, CTAs, etc.
 */
export function BuilderSection({model, url}: Readonly<BuilderSectionProperties>) {
	const [content, setContent] = useState<BuilderContent | undefined>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSection() {
			try {
				const sectionContent = await fetchOneEntry({
					model,
					apiKey: BUILDER_API_KEY,
					userAttributes: {
						urlPath: url || (globalThis.window === undefined ? '/' : globalThis.location.pathname),
					},
				});
				setContent(sectionContent);
			} catch (error) {
				console.error(`Error fetching section ${model}:`, error);
			} finally {
				setLoading(false);
			}
		}

		fetchSection();
	}, [model, url]);

	// Don't render anything if loading or no content
	if (loading || !content) {
		return null;
	}

	return (
		<Content
			content={content}
			model={model}
			apiKey={BUILDER_API_KEY}
			customComponents={customComponents}
		/>
	);
}

/**
 * Specific section components for common use cases
 */

export function AnnouncementBarSection() {
	return <BuilderSection model='announcement-bar' />;
}

export function HeroSection({url}: {url?: string}) {
	return <BuilderSection model='hero-section' url={url} />;
}

export function CTASection({url}: {url?: string}) {
	return <BuilderSection model='cta-section' url={url} />;
}

export function FooterCTASection() {
	return <BuilderSection model='footer-cta' />;
}

export function FAQSection({url}: {url?: string}) {
	return <BuilderSection model='faq-section' url={url} />;
}
