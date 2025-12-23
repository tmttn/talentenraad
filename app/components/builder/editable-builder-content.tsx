'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {Content, type BuilderContent as BuilderContentType} from '@builder.io/sdk-react-nextjs';
import {Layers} from 'lucide-react';
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
import {BlockManager} from './block-manager';

// Builder.io block type
type BuilderBlock = {
  '@type': '@builder.io/sdk:Element';
  id: string;
  component?: {
    name: string;
    options?: Record<string, unknown>;
  };
  children?: BuilderBlock[];
  responsiveStyles?: Record<string, unknown>;
  [key: string]: unknown;
};

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
  const [isBlockManagerOpen, setIsBlockManagerOpen] = useState(false);
  const [localBlocks, setLocalBlocks] = useState<BuilderBlock[]>([]);
  const [originalBlocks, setOriginalBlocks] = useState<BuilderBlock[]>([]);

  // Initialize blocks from content
  useEffect(() => {
    const blocks = (content?.data?.blocks as BuilderBlock[] | undefined) ?? [];
    setLocalBlocks(blocks);
    setOriginalBlocks(blocks);
  }, [content]);

  const contentId = content?.id ?? '';

  const handleBlocksChange = useCallback((newBlocks: BuilderBlock[]) => {
    setLocalBlocks(newBlocks);

    // Register the change with edit mode context
    if (editMode) {
      editMode.registerChange({
        contentId,
        model,
        field: 'blocks',
        value: JSON.stringify(newBlocks),
        originalValue: JSON.stringify(originalBlocks),
      });
    }
  }, [contentId, model, editMode, originalBlocks]);

  // Create modified content with local blocks for rendering
  const modifiedContent = useMemo((): BuilderContentType | null => {
    if (!content) {
      return null;
    }

    const result: BuilderContentType = {
      ...content,
      data: {
        ...content.data,
        blocks: localBlocks,
      },
    };
    return result;
  }, [content, localBlocks]);

  // If not in edit mode, render normally with original content
  if (!editMode?.isEditMode) {
    return (
      <Content
        content={content}
        apiKey={apiKey}
        model={model}
        customComponents={customComponents}
      />
    );
  }

  // In edit mode, render with potentially modified blocks
  return (
    <div className='relative'>
      {/* Floating button to open block manager */}
      <button
        type='button'
        onClick={() => {
          setIsBlockManagerOpen(true);
        }}
        className='fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-button shadow-lg hover:bg-gray-800 transition-colors'
        title='Blokken beheren'
      >
        <Layers className='w-4 h-4' />
        <span>Blokken</span>
        {localBlocks.length > 0 && (
          <span className='bg-white/20 px-1.5 py-0.5 rounded text-xs'>
            {localBlocks.length}
          </span>
        )}
      </button>

      {/* Render content with modified blocks */}
      <Content
        content={modifiedContent}
        apiKey={apiKey}
        model={model}
        customComponents={customComponents}
      />

      {/* Block manager sidebar */}
      <BlockManager
        blocks={localBlocks}
        onBlocksChange={handleBlocksChange}
        isOpen={isBlockManagerOpen}
        onClose={() => {
          setIsBlockManagerOpen(false);
        }}
      />
    </div>
  );
}
