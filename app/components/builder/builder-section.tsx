'use client';

import {useEffect, useState} from 'react';
import {Content, fetchOneEntry, type BuilderContent} from '@builder.io/sdk-react-nextjs';
import {HeroInfo} from '@features/marketing/hero';
import {CTABannerInfo} from '@features/marketing/cta-banner';
import {InfoCardInfo} from '@features/info/info-card';
import {SectionInfo} from '@components/section';
import {FAQInfo} from '@features/faq/faq';
import {ActiviteitenListInfo} from '@features/activities/activiteiten-list';
import {NieuwsListInfo} from '@features/news/nieuws-list';
import {DecorationInfo, DividerInfo} from '@components/decorations';
import {SiteHeaderInfo} from '@components/layout/site-header';
import {SiteFooterInfo} from '@components/layout/site-footer';
import {ActiviteitenArchiefInfo} from '@features/activities/activiteiten-archief';

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
	SiteHeaderInfo,
	SiteFooterInfo,
	ActiviteitenArchiefInfo,
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
	const [content, setContent] = useState<BuilderContent | undefined>(undefined);
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
				setContent(sectionContent ?? undefined);
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

export function SiteHeaderSection() {
	return <BuilderSection model='site-header' />;
}

export function SiteFooterSection() {
	return <BuilderSection model='site-footer' />;
}
