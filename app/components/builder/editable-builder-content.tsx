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
      {/* Floating action panel */}
      <div className='fixed bottom-6 right-6 z-40 flex flex-col gap-2'>
        {/* Block manager button - prominent */}
        <button
          type='button'
          onClick={() => {
            setIsBlockManagerOpen(true);
          }}
          className='flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-button shadow-lg hover:bg-primary-hover transition-all hover:scale-105 group'
          title='Blokken beheren - Voeg secties toe, verwijder of herschik'
        >
          <Layers className='w-5 h-5' />
          <div className='flex flex-col items-start'>
            <span className='font-medium'>Blokken beheren</span>
            <span className='text-xs text-white/70 group-hover:text-white/90'>
              {localBlocks.length} {localBlocks.length === 1 ? 'sectie' : 'secties'} op deze pagina
            </span>
          </div>
        </button>

        {/* Help tooltip */}
        <div className='bg-gray-800 text-white text-xs px-3 py-2 rounded-button shadow-lg'>
          <p className='font-medium mb-1'>Snelle tips:</p>
          <ul className='text-gray-300 space-y-0.5'>
            <li>• Klik direct op tekst om te bewerken</li>
            <li>• Sleep blokken om te herschikken</li>
          </ul>
        </div>
      </div>

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
