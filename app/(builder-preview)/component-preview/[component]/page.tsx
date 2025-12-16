'use client';

import {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
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
import {TypographyInfo} from '@components/ui/typography';
import {CtaButtonInfo} from '@components/ui/cta-button';
import {ActivitiesArchiveInfo} from '@features/activities/activities-archive';
import {HomepageDashboardInfo} from '@features/dashboard/homepage-dashboard';
import {NewsletterSignupInfo} from '@features/marketing/newsletter-signup';
import {UnifiedCtaInfo} from '@features/marketing/unified-cta';
import {SiteHeaderInfo} from '@components/layout/site-header';
import {SiteFooterInfo} from '@components/layout/site-footer';

// Component registry with sample props for preview
const componentRegistry: Record<string, {
	info: {
		name: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: React.ComponentType<any>;
	};
	sampleProps: Record<string, unknown>;
}> = {
	hero: {
		info: HeroInfo,
		sampleProps: {
			title: 'Welkom bij Talentenraad',
			subtitle: 'Samen bouwen aan talent',
			backgroundImage: 'https://cdn.builder.io/api/v1/image/assets%2F3706422a8e454ceebe64acdc5a1475ba%2F89f5a0b8c0a5454b9f3b3b5e5a0b8c0a',
			size: 'medium',
		},
	},
	'cta-banner': {
		info: CtaBannerInfo,
		sampleProps: {
			title: 'Word lid van onze community',
			description: 'Sluit je aan bij honderden anderen',
			buttonText: 'Aanmelden',
			buttonLink: '/aanmelden',
			variant: 'default',
		},
	},
	'info-card': {
		info: InfoCardInfo,
		sampleProps: {
			title: 'Informatie',
			description: 'Dit is een voorbeeld van een info kaart met belangrijke informatie.',
			icon: 'heart',
			variant: 'default',
		},
	},
	section: {
		info: SectionInfo,
		sampleProps: {
			background: 'light',
			alignment: 'center',
			size: 'medium',
			width: 'default',
		},
	},
	faq: {
		info: FaqInfo,
		sampleProps: {},
	},
	'activities-list': {
		info: ActivitiesListInfo,
		sampleProps: {
			limit: 3,
			showViewAll: true,
			viewAllLink: '/activiteiten',
		},
	},
	'news-list': {
		info: NewsListInfo,
		sampleProps: {
			limit: 3,
			layout: 'grid',
			showImages: true,
		},
	},
	decoration: {
		info: DecorationInfo,
		sampleProps: {
			type: 'confetti',
			position: 'center',
			size: 'medium',
		},
	},
	divider: {
		info: DividerInfo,
		sampleProps: {
			type: 'wave',
			color: 'pink',
			flip: false,
		},
	},
	'announcement-banner': {
		info: AnnouncementBannerInfo,
		sampleProps: {},
	},
	'team-grid': {
		info: TeamGridInfo,
		sampleProps: {
			columns: 3,
			showDescription: true,
		},
	},
	'feature-grid': {
		info: FeatureGridInfo,
		sampleProps: {
			title: 'Onze diensten',
			features: [
				{icon: 'heart', title: 'Begeleiding', description: 'Persoonlijke ondersteuning'},
				{icon: 'users', title: 'Community', description: 'Samen sterk'},
				{icon: 'calendar', title: 'Activiteiten', description: 'Regelmatige evenementen'},
			],
			columns: 3,
		},
	},
	'contact-form': {
		info: ContactFormInfo,
		sampleProps: {
			showPhone: true,
			showSubject: true,
		},
	},
	'calendar-section': {
		info: CalendarSectionInfo,
		sampleProps: {
			showViewAll: true,
			viewAllLink: '/activiteiten',
			limit: 5,
		},
	},
	'event-card': {
		info: EventCardInfo,
		sampleProps: {
			title: 'Voorbeeldevenement',
			date: '2025-01-15',
			time: '14:00',
			location: 'Amsterdam',
			description: 'Dit is een voorbeeld van een evenement kaart.',
		},
	},
	'news-card': {
		info: NewsCardInfo,
		sampleProps: {
			title: 'Nieuwsbericht',
			date: '2025-01-15',
			excerpt: 'Dit is een voorbeeld van een nieuwskaart met een korte samenvatting.',
			category: 'Nieuws',
		},
	},
	'team-member': {
		info: TeamMemberInfo,
		sampleProps: {
			name: 'Jan Jansen',
			role: 'Voorzitter',
			description: 'Jan is al 5 jaar actief bij Talentenraad.',
			variant: 'card',
		},
	},
	typography: {
		info: TypographyInfo,
		sampleProps: {
			text: 'Voorbeeldtekst',
			variant: 'h1',
			color: 'default',
			alignment: 'left',
		},
	},
	'cta-button': {
		info: CtaButtonInfo,
		sampleProps: {
			text: 'Klik hier',
			href: '#',
			variant: 'primary',
			size: 'md',
		},
	},
	'activities-archive': {
		info: ActivitiesArchiveInfo,
		sampleProps: {},
	},
	'homepage-dashboard': {
		info: HomepageDashboardInfo,
		sampleProps: {},
	},
	'newsletter-signup': {
		info: NewsletterSignupInfo,
		sampleProps: {
			buttonText: 'Aanmelden',
		},
	},
	'unified-cta': {
		info: UnifiedCtaInfo,
		sampleProps: {
			variant: 'full',
		},
	},
	'site-header': {
		info: SiteHeaderInfo,
		sampleProps: {
			logoAlt: 'Talentenraad',
			navigationLinks: [
				{text: 'Home', url: '/'},
				{text: 'Over ons', url: '/over-ons'},
				{text: 'Activiteiten', url: '/activiteiten'},
				{text: 'Contact', url: '/contact'},
			],
		},
	},
	'site-footer': {
		info: SiteFooterInfo,
		sampleProps: {
			tagline: 'Samen bouwen aan talent',
			copyrightText: '© 2025 Talentenraad',
		},
	},
};

type ComponentPreviewPageProperties = {
	params: Promise<{component: string}>;
};

/**
 * Component Preview Page
 *
 * This page renders individual Builder.io custom components in isolation.
 * Set this URL as the preview URL in your component settings:
 * https://your-site.com/component-preview/[component-name]
 *
 * Query parameters can override sample props:
 * ?title=Custom%20Title&variant=accent
 */
export default function ComponentPreviewPage({params}: ComponentPreviewPageProperties) {
	const [componentName, setComponentName] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const searchParameters = useSearchParams();

	// Get component name from params
	useEffect(() => {
		async function resolveParameters() {
			const resolvedParameters = await params;
			setComponentName(resolvedParameters.component);
			setLoading(false);
		}

		void resolveParameters();
	}, [params]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
					<p className='mt-4 text-gray-600'>Component laden...</p>
				</div>
			</div>
		);
	}

	const componentEntry = componentRegistry[componentName];

	if (!componentEntry) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center max-w-md px-4'>
					<h1 className='text-2xl font-bold text-gray-800'>Component niet gevonden</h1>
					<p className='text-gray-600 mt-2'>
						Component &quot;{componentName}&quot; bestaat niet.
					</p>
					<div className='mt-6'>
						<h2 className='text-lg font-semibold text-gray-700 mb-2'>Beschikbare componenten:</h2>
						<ul className='text-sm text-gray-500 space-y-1'>
							{Object.keys(componentRegistry).map(name => (
								<li key={name}>
									<a
										href={`/component-preview/${name}`}
										className='text-primary hover:underline'
									>
										{name}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		);
	}

	// Merge sample props with query parameters
	const queryProps: Record<string, unknown> = {};
	for (const [key, value] of searchParameters.entries()) {
		// Try to parse JSON values, otherwise use string
		try {
			queryProps[key] = JSON.parse(value);
		} catch {
			queryProps[key] = value;
		}
	}

	const mergedProps = {...componentEntry.sampleProps, ...queryProps};
	const Component = componentEntry.info.component;

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Preview header with component info */}
			<div className='bg-white border-b border-gray-200 px-4 py-2 text-sm text-gray-600'>
				<span className='font-medium'>Component:</span> {componentEntry.info.name}
			</div>

			{/* Component preview area */}
			<div className='component-preview'>
				<Component {...mergedProps} />
			</div>
		</div>
	);
}
