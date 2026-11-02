import ActivityDetailPage, {generateStaticParams} from '../../../app/(main)/activiteiten/[slug]/page';
import nextConfig from '../../../next.config.js';

const {notFound} = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/navigation', () => ({notFound}));
vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

// Runs against the real content/ directory.
describe('ActivityDetailPage with real content', () => {
  it('redirects the legacy alias permanently in next.config.js, and does not render it as a page', async () => {
    const redirects = await (nextConfig as {redirects: () => Promise<unknown[]>}).redirects();
    expect(redirects).toContainEqual({
      source: '/activiteiten/-de-talentenfuif-2025-komt-eraan',
      destination: '/activiteiten/de-talentenfuif-2025-komt-eraan',
      permanent: true,
    });
    expect(generateStaticParams()).toContainEqual({slug: 'de-talentenfuif-2025-komt-eraan'});
    expect(generateStaticParams()).not.toContainEqual({slug: '-de-talentenfuif-2025-komt-eraan'});
  });

  it('returns 404 for an unknown slug', async () => {
    await expect(ActivityDetailPage({params: Promise.resolve({slug: 'bestaat-niet'})}))
      .rejects.toThrow('NEXT_NOT_FOUND');
  });
});
