'use client';

import {useState, useCallback} from 'react';
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
import {ComponentPicker, type ComponentDefinition} from './component-picker';
import {BlockControls, AddBlockButton} from './block-controls';

// Builder.io block type
type BuilderBlock = {
  '@type': string;
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [localBlocks, setLocalBlocks] = useState<BuilderBlock[]>(() => {
    const blocks = content?.data?.blocks as BuilderBlock[] | undefined;
    return blocks ?? [];
  });

  // If not in edit mode, render normally
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

  const contentId = content?.id ?? '';

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) {
      return;
    }

    setLocalBlocks(blocks => {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      return newBlocks;
    });

    // Register change
    editMode.registerChange({
      contentId,
      model,
      field: 'blocks',
      value: 'reordered',
      originalValue: 'original',
    });
  }, [contentId, model, editMode]);

  const handleMoveDown = useCallback((index: number) => {
    setLocalBlocks(blocks => {
      if (index >= blocks.length - 1) {
        return blocks;
      }

      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      return newBlocks;
    });

    // Register change
    editMode.registerChange({
      contentId,
      model,
      field: 'blocks',
      value: 'reordered',
      originalValue: 'original',
    });
  }, [contentId, model, editMode]);

  const handleDelete = useCallback((index: number) => {
    setLocalBlocks(blocks => {
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      return newBlocks;
    });

    // Register change
    editMode.registerChange({
      contentId,
      model,
      field: 'blocks',
      value: 'deleted',
      originalValue: 'original',
    });
  }, [contentId, model, editMode]);

  const handleAddBlock = useCallback((index: number) => {
    setInsertIndex(index);
    setIsPickerOpen(true);
  }, []);

  const handleSelectComponent = useCallback((component: ComponentDefinition) => {
    if (insertIndex === null) {
      return;
    }

    const newBlock: BuilderBlock = {
      '@type': '@builder.io/sdk:Element',
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      component: {
        name: component.name,
        options: component.defaultProps,
      },
    };

    setLocalBlocks(blocks => {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      return newBlocks;
    });

    // Register change
    editMode.registerChange({
      contentId,
      model,
      field: 'blocks',
      value: JSON.stringify(newBlock),
      originalValue: 'null',
    });

    setInsertIndex(null);
  }, [insertIndex, contentId, model, editMode]);

  // Create modified content with local blocks
  const modifiedContent = content
    ? {
      ...content,
      data: {
        ...content.data,
        blocks: localBlocks,
      },
    }
    : null;

  const getBlockName = (block: BuilderBlock): string => {
    if (block.component?.name) {
      return block.component.name;
    }

    if (block['@type'] === '@builder.io/sdk:Element') {
      return 'Element';
    }

    return 'Block';
  };

  return (
    <div className='relative'>
      {/* Add block at the top */}
      {localBlocks.length === 0 && (
        <div className='py-8 px-6'>
          <AddBlockButton onClick={() => {
            handleAddBlock(0);
          }} />
        </div>
      )}

      {/* Render blocks with edit controls */}
      {localBlocks.map((block, index) => (
        <div key={block.id} className='group relative'>
          <BlockControls
            blockName={getBlockName(block)}
            canMoveUp={index > 0}
            canMoveDown={index < localBlocks.length - 1}
            onMoveUp={() => {
              handleMoveUp(index);
            }}
            onMoveDown={() => {
              handleMoveDown(index);
            }}
            onDelete={() => {
              handleDelete(index);
            }}
            onAddAbove={() => {
              handleAddBlock(index);
            }}
            onAddBelow={() => {
              handleAddBlock(index + 1);
            }}
          />

          {/* Highlight border on hover */}
          <div className='group-hover:ring-2 group-hover:ring-primary/30 group-hover:ring-offset-2 transition-all'>
            {/* Render the actual block content */}
            <Content
              content={{
                ...content,
                data: {
                  ...content?.data,
                  blocks: [block],
                },
              } as BuilderContentType}
              apiKey={apiKey}
              model={model}
              customComponents={customComponents}
            />
          </div>
        </div>
      ))}

      {/* Add block at the bottom */}
      {localBlocks.length > 0 && (
        <div className='py-8 px-6'>
          <AddBlockButton onClick={() => {
            handleAddBlock(localBlocks.length);
          }} />
        </div>
      )}

      {/* Component picker modal */}
      <ComponentPicker
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setInsertIndex(null);
        }}
        onSelect={handleSelectComponent}
      />
    </div>
  );
}
