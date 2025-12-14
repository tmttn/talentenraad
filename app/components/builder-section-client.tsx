'use client';

import {Content, type BuilderContent} from '@builder.io/sdk-react-nextjs';
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
// eslint-disable-next-line import-x/extensions
import {AnnouncementBannerInfo} from './announcement-banner';
// eslint-disable-next-line import-x/extensions
import {TeamGridInfo} from './team-grid';
// eslint-disable-next-line import-x/extensions
import {FeatureGridInfo} from './feature-grid';
// eslint-disable-next-line import-x/extensions
import {ContactFormInfo} from './contact-form';
// eslint-disable-next-line import-x/extensions
import {CalendarSectionInfo} from './calendar-section';
// eslint-disable-next-line import-x/extensions
import {EventCardInfo} from './event-card';
// eslint-disable-next-line import-x/extensions
import {NewsCardInfo} from './news-card';
// eslint-disable-next-line import-x/extensions
import {TeamMemberInfo} from './team-member';

// All custom components available for sections
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
	AnnouncementBannerInfo,
	TeamGridInfo,
	FeatureGridInfo,
	ContactFormInfo,
	CalendarSectionInfo,
	EventCardInfo,
	NewsCardInfo,
	TeamMemberInfo,
];

type BuilderSectionClientProperties = {
	content: BuilderContent;
	model: string;
	apiKey: string;
};

/**
 * Client-side Builder Section Renderer
 *
 * Receives pre-fetched content from the server and renders it.
 * This is a lightweight client component that handles the interactive parts.
 */
export function BuilderSectionClient({
	content,
	model,
	apiKey,
}: Readonly<BuilderSectionClientProperties>) {
	return (
		<Content
			content={content}
			model={model}
			apiKey={apiKey}
			customComponents={customComponents}
		/>
	);
}
