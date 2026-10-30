'use client';

import type {Mock} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {useSearchParams} from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock all Builder component imports
vi.mock('@features/marketing/hero', () => ({
  HeroInfo: {
    name: 'Hero',
    component: ({title}: {title?: string}) => <div data-testid='hero'>{title ?? 'Hero'}</div>,
  },
}));

vi.mock('@features/marketing/cta-banner', () => ({
  CtaBannerInfo: {
    name: 'CtaBanner',
    component: () => <div data-testid='cta-banner'>CTA Banner</div>,
  },
}));

vi.mock('@features/info/info-card', () => ({
  InfoCardInfo: {
    name: 'InfoCard',
    component: () => <div data-testid='info-card'>Info Card</div>,
  },
}));

vi.mock('@components/section', () => ({
  SectionInfo: {
    name: 'Section',
    component: () => <div data-testid='section'>Section</div>,
  },
}));

vi.mock('@features/faq/faq', () => ({
  FaqInfo: {
    name: 'Faq',
    component: () => <div data-testid='faq'>FAQ</div>,
  },
}));

vi.mock('@features/activities/activities-list', () => ({
  ActivitiesListInfo: {
    name: 'ActivitiesList',
    component: () => <div data-testid='activities-list'>Activities List</div>,
  },
}));

vi.mock('@features/news/news-list', () => ({
  NewsListInfo: {
    name: 'NewsList',
    component: () => <div data-testid='news-list'>News List</div>,
  },
}));

vi.mock('@components/decorations', () => ({
  DecorationInfo: {
    name: 'Decoration',
    component: () => <div data-testid='decoration'>Decoration</div>,
  },
  DividerInfo: {
    name: 'Divider',
    component: () => <div data-testid='divider'>Divider</div>,
  },
}));

vi.mock('@features/marketing/announcement-banner', () => ({
  AnnouncementBannerInfo: {
    name: 'AnnouncementBanner',
    component: () => <div data-testid='announcement-banner'>Announcement Banner</div>,
  },
}));

vi.mock('@features/team/team-grid', () => ({
  TeamGridInfo: {
    name: 'TeamGrid',
    component: () => <div data-testid='team-grid'>Team Grid</div>,
  },
}));

vi.mock('@features/info/feature-grid', () => ({
  FeatureGridInfo: {
    name: 'FeatureGrid',
    component: () => <div data-testid='feature-grid'>Feature Grid</div>,
  },
}));

vi.mock('@features/contact/contact-form', () => ({
  ContactFormInfo: {
    name: 'ContactForm',
    component: () => <div data-testid='contact-form'>Contact Form</div>,
  },
}));

vi.mock('@features/activities/calendar-section', () => ({
  CalendarSectionInfo: {
    name: 'CalendarSection',
    component: () => <div data-testid='calendar-section'>Calendar Section</div>,
  },
}));

vi.mock('@features/activities/event-card', () => ({
  EventCardInfo: {
    name: 'EventCard',
    component: () => <div data-testid='event-card'>Event Card</div>,
  },
}));

vi.mock('@features/news/news-card', () => ({
  NewsCardInfo: {
    name: 'NewsCard',
    component: () => <div data-testid='news-card'>News Card</div>,
  },
}));

vi.mock('@features/team/team-member', () => ({
  TeamMemberInfo: {
    name: 'TeamMember',
    component: () => <div data-testid='team-member'>Team Member</div>,
  },
}));

vi.mock('@components/ui/typography', () => ({
  TypographyInfo: {
    name: 'Typography',
    component: () => <div data-testid='typography'>Typography</div>,
  },
}));

vi.mock('@components/ui/cta-button', () => ({
  CtaButtonInfo: {
    name: 'CtaButton',
    component: () => <div data-testid='cta-button'>CTA Button</div>,
  },
}));

vi.mock('@features/activities/activities-archive', () => ({
  ActivitiesArchiveInfo: {
    name: 'ActivitiesArchive',
    component: () => <div data-testid='activities-archive'>Activities Archive</div>,
  },
}));

vi.mock('@features/dashboard/homepage-dashboard', () => ({
  HomepageDashboardInfo: {
    name: 'HomepageDashboard',
    component: () => <div data-testid='homepage-dashboard'>Homepage Dashboard</div>,
  },
}));

vi.mock('@features/marketing/newsletter-signup', () => ({
  NewsletterSignupInfo: {
    name: 'NewsletterSignup',
    component: () => <div data-testid='newsletter-signup'>Newsletter Signup</div>,
  },
}));

vi.mock('@features/marketing/unified-cta', () => ({
  UnifiedCtaInfo: {
    name: 'UnifiedCta',
    component: () => <div data-testid='unified-cta'>Unified CTA</div>,
  },
}));

vi.mock('@components/layout/site-header', () => ({
  SiteHeaderInfo: {
    name: 'SiteHeader',
    component: () => <div data-testid='site-header'>Site Header</div>,
  },
}));

vi.mock('@components/layout/site-footer', () => ({
  SiteFooterInfo: {
    name: 'SiteFooter',
    component: () => <div data-testid='site-footer'>Site Footer</div>,
  },
}));

// Import component after mocks
import ComponentPreviewPage from '../../../app/(builder-preview)/component-preview/[component]/page';

const mockUseSearchParams = useSearchParams as Mock<typeof useSearchParams>;

describe('ComponentPreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
  });

  it('shows loading state initially', async () => {
    const params = Promise.resolve({component: 'hero'});

    render(<ComponentPreviewPage params={params} />);

    expect(screen.getByText('Component laden...')).toBeInTheDocument();
  });

  it('renders the hero component when component is hero', async () => {
    const params = Promise.resolve({component: 'hero'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });

    expect(screen.getByText(/Component:/)).toBeInTheDocument();
  });

  it('shows error message for non-existent component', async () => {
    const params = Promise.resolve({component: 'nonexistent'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText('Component niet gevonden')).toBeInTheDocument();
    });

    expect(screen.getByText(/Component "nonexistent" bestaat niet/)).toBeInTheDocument();
  });

  it('shows list of available components when component not found', async () => {
    const params = Promise.resolve({component: 'invalid'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText('Beschikbare componenten:')).toBeInTheDocument();
    });

    // Should show links to valid components
    expect(screen.getByRole('link', {name: 'hero'})).toBeInTheDocument();
  });

  it('renders component with query params merged into props', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('title', 'Custom Title');
    mockUseSearchParams.mockReturnValue(searchParams as unknown as ReturnType<typeof useSearchParams>);

    const params = Promise.resolve({component: 'hero'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('parses JSON values from query params', async () => {
    const searchParams = new URLSearchParams();
    searchParams.set('features', '["one","two"]');
    mockUseSearchParams.mockReturnValue(searchParams as unknown as ReturnType<typeof useSearchParams>);

    const params = Promise.resolve({component: 'hero'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });
  });

  it('renders different components correctly', async () => {
    const params = Promise.resolve({component: 'faq'});

    render(<ComponentPreviewPage params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('faq')).toBeInTheDocument();
    });
  });
});
