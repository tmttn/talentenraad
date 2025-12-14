'use client';

import {Content, type BuilderContent} from '@builder.io/sdk-react-nextjs';
import {HeroInfo} from '@features/marketing/hero';
import {CtaBannerInfo} from '@features/marketing/cta-banner';
import {InfoCardInfo} from '@features/info/info-card';
import {SectionInfo} from '@components/section';
import {FaqInfo} from '@features/faq/faq';
import {ActivitiesListInfo} from '@features/activities/activities-list';
import {NewsListInfo} from '@features/news/news-list';
import {DecorationInfo, DividerInfo} from '@components/decorations';
import {AnnouncementBannerInfo} from '@features/marketing/announcement-banner';
import {TeamGridInfo} from '@features/team/team-grid';
import {FeatureGridInfo} from '@features/info/feature-grid';
import {ContactFormInfo} from '@features/contact/contact-form';
import {CalendarSectionInfo} from '@features/activities/calendar-section';
import {EventCardInfo} from '@features/activities/event-card';
import {NewsCardInfo} from '@features/news/news-card';
import {TeamMemberInfo} from '@features/team/team-member';
import {ActivitiesArchiveInfo} from '@features/activities/activities-archive';
import {HomepageDashboardInfo} from '@features/dashboard/homepage-dashboard';
import {NewsletterSignupInfo} from '@features/marketing/newsletter-signup';
import {UnifiedCtaInfo} from '@features/marketing/unified-cta';

// All custom components available for sections
const customComponents = [
	HeroInfo,
	CtaBannerInfo,
	InfoCardInfo,
	SectionInfo,
	FaqInfo,
	ActivitiesListInfo,
	NewsListInfo,
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
	ActivitiesArchiveInfo,
	HomepageDashboardInfo,
	NewsletterSignupInfo,
	UnifiedCtaInfo,
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
