import ActivityDetailPage from '../../../app/(main)/activiteiten/[slug]/page';

const {notFound, permanentRedirect} = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next/navigation', () => ({notFound, permanentRedirect}));
vi.mock('@components/claps', () => ({ClapButton: () => <div data-testid='clap-button' />}));
vi.mock('@components/layout/page-with-announcements', () => ({
  PageWithAnnouncements: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

// Runs against the real content/ directory.
describe('ActivityDetailPage with real content', () => {
  it('redirects the legacy alias to the canonical slug', async () => {
    await expect(ActivityDetailPage({params: Promise.resolve({slug: '-de-talentenfuif-2025-komt-eraan'})}))
      .rejects.toThrow('NEXT_REDIRECT:/activiteiten/de-talentenfuif-2025-komt-eraan');
    expect(permanentRedirect).toHaveBeenCalledWith('/activiteiten/de-talentenfuif-2025-komt-eraan');
  });

  it('returns 404 for an unknown slug', async () => {
    await expect(ActivityDetailPage({params: Promise.resolve({slug: 'bestaat-niet'})}))
      .rejects.toThrow('NEXT_NOT_FOUND');
  });
});
