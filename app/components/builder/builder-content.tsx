'use client';

import {Content, type BuilderContent as BuilderContentType} from '@builder.io/sdk-react-nextjs';
import {SiteHeaderInfo} from '@components/layout/site-header';
import {SiteFooterInfo} from '@components/layout/site-footer';
import {HeroInfo} from '@features/marketing/hero';
import {EventCardInfo} from '@features/activities/event-card';
import {ContactFormInfo} from '@features/contact/contact-form';
import {NewsCardInfo} from '@features/news/news-card';
import {CalendarSectionInfo} from '@features/activities/calendar-section';
import {TeamMemberInfo} from '@features/team/team-member';
import {CTABannerInfo} from '@features/marketing/cta-banner';
import {InfoCardInfo} from '@features/info/info-card';
import {ActiviteitenListInfo} from '@features/activities/activiteiten-list';
import {TeamGridInfo} from '@features/team/team-grid';
import {FeatureGridInfo} from '@features/info/feature-grid';
import {SectionInfo} from '@components/section';
import {NieuwsListInfo} from '@features/news/nieuws-list';
import {AnnouncementBannerInfo} from '@features/marketing/announcement-banner';
import {FAQInfo} from '@features/faq/faq';
import {DecorationInfo, DividerInfo} from '@components/decorations';
import {ActiviteitenArchiefInfo} from '@features/activities/activiteiten-archief';
import {HomepageDashboardInfo} from '@features/dashboard/homepage-dashboard';
import {NewsletterSignupInfo} from '@features/marketing/newsletter-signup';
import {UnifiedCTAInfo} from '@features/marketing/unified-cta';

type BuilderContentProperties = {
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	content: BuilderContentType | null;
	apiKey: string;
	model: string;
};

export function BuilderContent({content, apiKey, model}: Readonly<BuilderContentProperties>) {
	return (
		<Content
			content={content}
			apiKey={apiKey}
			model={model}
			customComponents={[
				SiteHeaderInfo,
				SiteFooterInfo,
				HeroInfo,
				EventCardInfo,
				ContactFormInfo,
				NewsCardInfo,
				CalendarSectionInfo,
				TeamMemberInfo,
				CTABannerInfo,
				InfoCardInfo,
				ActiviteitenListInfo,
				TeamGridInfo,
				FeatureGridInfo,
				SectionInfo,
				NieuwsListInfo,
				AnnouncementBannerInfo,
				FAQInfo,
				DecorationInfo,
				DividerInfo,
				ActiviteitenArchiefInfo,
				HomepageDashboardInfo,
				NewsletterSignupInfo,
				UnifiedCTAInfo,
			]}
		/>
	);
}
