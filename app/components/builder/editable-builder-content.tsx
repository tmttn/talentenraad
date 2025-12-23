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
import {CtaBannerInfo} from '@features/marketing/cta-banner';
import {InfoCardInfo} from '@features/info/info-card';
import {ActivitiesListInfo} from '@features/activities/activities-list';
import {TeamGridInfo} from '@features/team/team-grid';
import {FeatureGridInfo} from '@features/info/feature-grid';
import {SectionInfo} from '@components/section';
import {NewsListInfo} from '@features/news/news-list';
import {AnnouncementBannerInfo} from '@features/marketing/announcement-banner';
import {FaqInfo} from '@features/faq/faq';
import {DecorationInfo, DividerInfo} from '@components/decorations';
import {ActivitiesArchiveInfo} from '@features/activities/activities-archive';
import {HomepageDashboardInfo} from '@features/dashboard/homepage-dashboard';
import {NewsletterSignupInfo} from '@features/marketing/newsletter-signup';
import {UnifiedCtaInfo} from '@features/marketing/unified-cta';
import {CtaButtonInfo} from '@components/ui/cta-button';
import {TypographyInfo} from '@components/ui/typography';
import {PhotoGalleryInfo} from '@features/gallery/photo-gallery';
import {SponsorBannerInfo} from '@features/sponsors/sponsor-banner';
import {useEditModeOptional} from './edit-mode-context';

const customComponents = [
  SiteHeaderInfo,
  SiteFooterInfo,
  HeroInfo,
  EventCardInfo,
  ContactFormInfo,
  NewsCardInfo,
  CalendarSectionInfo,
  TeamMemberInfo,
  CtaBannerInfo,
  InfoCardInfo,
  ActivitiesListInfo,
  TeamGridInfo,
  FeatureGridInfo,
  SectionInfo,
  NewsListInfo,
  AnnouncementBannerInfo,
  FaqInfo,
  DecorationInfo,
  DividerInfo,
  ActivitiesArchiveInfo,
  HomepageDashboardInfo,
  NewsletterSignupInfo,
  UnifiedCtaInfo,
  CtaButtonInfo,
  TypographyInfo,
  PhotoGalleryInfo,
  SponsorBannerInfo,
];

type EditableBuilderContentProps = {
  content: BuilderContentType | null;
  apiKey: string;
  model: string;
};

export function EditableBuilderContent({
  content,
  apiKey,
  model,
}: Readonly<EditableBuilderContentProps>) {
  const editMode = useEditModeOptional();

  // Always render the content the same way - Builder.io handles its own rendering
  // The edit mode context is available for EditableText components within the page
  return (
    <div className={editMode?.isEditMode ? 'builder-edit-mode' : ''}>
      <Content
        content={content}
        apiKey={apiKey}
        model={model}
        customComponents={customComponents}
      />
    </div>
  );
}
