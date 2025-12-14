'use client';

import {useEffect, useState} from 'react';
import {
	Content,
	fetchOneEntry,
	isPreviewing,
	isEditing,
	type BuilderContent,
} from '@builder.io/sdk-react-nextjs';
import {useSearchParams} from 'next/navigation';
// eslint-disable-next-line import-x/extensions
import {HeroInfo} from '@/components/hero';
// eslint-disable-next-line import-x/extensions
import {CTABannerInfo} from '@/components/cta-banner';
// eslint-disable-next-line import-x/extensions
import {InfoCardInfo} from '@/components/info-card';
// eslint-disable-next-line import-x/extensions
import {SectionInfo} from '@/components/section';
// eslint-disable-next-line import-x/extensions
import {FAQInfo} from '@/components/faq';
// eslint-disable-next-line import-x/extensions
import {ActiviteitenListInfo} from '@/components/activiteiten-list';
// eslint-disable-next-line import-x/extensions
import {NieuwsListInfo} from '@/components/nieuws-list';
// eslint-disable-next-line import-x/extensions
import {DecorationInfo, DividerInfo} from '@/components/decorations';
// eslint-disable-next-line import-x/extensions
import {AnnouncementBannerInfo} from '@/components/announcement-banner';
// eslint-disable-next-line import-x/extensions
import {TeamGridInfo} from '@/components/team-grid';
// eslint-disable-next-line import-x/extensions
import {FeatureGridInfo} from '@/components/feature-grid';
// eslint-disable-next-line import-x/extensions
import {ContactFormInfo} from '@/components/contact-form';
// eslint-disable-next-line import-x/extensions
import {CalendarSectionInfo} from '@/components/calendar-section';
// eslint-disable-next-line import-x/extensions
import {EventCardInfo} from '@/components/event-card';
// eslint-disable-next-line import-x/extensions
import {NewsCardInfo} from '@/components/news-card';
// eslint-disable-next-line import-x/extensions
import {TeamMemberInfo} from '@/components/team-member';

// eslint-disable-next-line n/prefer-global/process
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

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

type SectionPreviewPageProperties = {
	params: Promise<{model: string}>;
};

/**
 * Section Preview Page
 *
 * This page is used by Builder.io to preview section content.
 * Set this URL as the preview URL in your section model settings:
 * https://your-site.com/sections/[model-name]
 *
 * For example, for an "announcement-bar" model:
 * https://your-site.com/sections/announcement-bar
 */
export default function SectionPreviewPage({params}: SectionPreviewPageProperties) {
	const [model, setModel] = useState<string>('');
	const [content, setContent] = useState<BuilderContent | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);
	const searchParameters = useSearchParams();

	// Get model from params
	useEffect(() => {
		async function resolveParameters() {
			const resolvedParameters = await params;
			setModel(resolvedParameters.model);
		}

		void resolveParameters();
	}, [params]);

	// Fetch section content
	useEffect(() => {
		if (!model) {
			return;
		}

		async function fetchSection() {
			setLoading(true);
			setError(undefined);

			try {
				const searchParametersObject = Object.fromEntries(searchParameters.entries());
				const sectionContent = await fetchOneEntry({
					model,
					apiKey: builderApiKey,
					options: searchParametersObject,
					userAttributes: {
						urlPath: `/sections/${model}`,
					},
				});

				setContent(sectionContent ?? undefined);

				// Allow empty content in preview/edit mode
				if (!sectionContent && !isPreviewing(searchParametersObject) && !isEditing(searchParametersObject)) {
					setError(`No content found for section model "${model}"`);
				}
			} catch (fetchError) {
				console.error(`Error fetching section ${model}:`, fetchError);
				setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
			} finally {
				setLoading(false);
			}
		}

		void fetchSection();
	}, [model, searchParameters]);

	// Loading state
	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
					<p className='mt-4 text-gray-600'>Sectie laden...</p>
				</div>
			</div>
		);
	}

	// Error state (only shown outside of preview/edit mode)
	if (error && !content) {
		const searchParametersObject = Object.fromEntries(searchParameters.entries());
		const inEditMode = isPreviewing(searchParametersObject) || isEditing(searchParametersObject);

		if (!inEditMode) {
			return (
				<div className='min-h-screen flex items-center justify-center bg-gray-50'>
					<div className='text-center max-w-md px-4'>
						<h1 className='text-2xl font-bold text-gray-800'>Sectie niet gevonden</h1>
						<p className='text-gray-600 mt-2'>{error}</p>
						<p className='text-gray-500 text-sm mt-4'>
							Zorg ervoor dat de sectie gepubliceerd is in Builder.io
						</p>
					</div>
				</div>
			);
		}
	}

	// Render the section content
	return (
		<div className='min-h-screen'>
			<Content
				content={content}
				model={model}
				apiKey={builderApiKey}
				customComponents={customComponents}
			/>
		</div>
	);
}
