'use client';

import {Content, type BuilderContent as BuilderContentType} from '@builder.io/sdk-react-nextjs';
// eslint-disable-next-line import-x/extensions
import {SiteHeaderInfo} from './site-header';
// eslint-disable-next-line import-x/extensions
import {SiteFooterInfo} from './site-footer';
// eslint-disable-next-line import-x/extensions
import {HeroInfo} from './hero';
// eslint-disable-next-line import-x/extensions
import {EventCardInfo} from './event-card';
// eslint-disable-next-line import-x/extensions
import {ContactFormInfo} from './contact-form';
// eslint-disable-next-line import-x/extensions
import {NewsCardInfo} from './news-card';
// eslint-disable-next-line import-x/extensions
import {CalendarSectionInfo} from './calendar-section';
// eslint-disable-next-line import-x/extensions
import {TeamMemberInfo} from './team-member';
// eslint-disable-next-line import-x/extensions
import {CTABannerInfo} from './cta-banner';
// eslint-disable-next-line import-x/extensions
import {InfoCardInfo} from './info-card';
// eslint-disable-next-line import-x/extensions
import {ActiviteitenListInfo} from './activiteiten-list';
// eslint-disable-next-line import-x/extensions
import {TeamGridInfo} from './team-grid';
// eslint-disable-next-line import-x/extensions
import {FeatureGridInfo} from './feature-grid';
// eslint-disable-next-line import-x/extensions
import {SectionInfo} from './section';
// eslint-disable-next-line import-x/extensions
import {NieuwsListInfo} from './nieuws-list';
// eslint-disable-next-line import-x/extensions
import {AnnouncementBannerInfo} from './announcement-banner';
// eslint-disable-next-line import-x/extensions
import {FAQInfo} from './faq';
// eslint-disable-next-line import-x/extensions
import {DecorationInfo, DividerInfo} from './decorations';
// eslint-disable-next-line import-x/extensions
import {ActiviteitenArchiefInfo} from './activiteiten-archief';

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
			]}
		/>
	);
}
