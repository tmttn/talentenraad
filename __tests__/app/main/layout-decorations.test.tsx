import {render, screen} from '@testing-library/react';
import {isValidElement, type ReactElement, type ReactNode} from 'react';
import {content} from '@lib/content';
import {fixtureSite} from '../../fixtures/site';
import MainSiteLayout from '../../../app/(main)/layout';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));
vi.mock('sonner', () => ({Toaster: () => null}));
vi.mock('@components/layout/site-footer-server', () => ({SiteFooterServer: () => null}));
vi.mock('@components/cookie-consent', () => ({
  CookieConsentProvider: ({children}: {children: ReactNode}) => <>{children}</>,
  CookieBanner: () => null,
}));
vi.mock('@components/feedback', () => ({ConditionalFeedbackButton: () => null}));
vi.mock('@components/seasonal-decorations', () => ({
  Snowfall: () => <div data-testid='snowfall' />,
  SeasonalStyles: () => <style data-testid='seasonal-styles' />,
}));

type Wrapper = (properties: {children: ReactNode}) => Promise<ReactNode>;

// MainSiteLayout is sync; the decorations wrapper is its async server component child.
function findWrapper(): Wrapper {
  const tree = MainSiteLayout({children: <p>pagina</p>}) as ReactElement<{children: ReactNode}>;
  const children = [tree.props.children].flat() as ReactNode[];
  const wrapper = children.find(child => isValidElement(child) && typeof child.type === 'function' && child.type.name === 'SafeSeasonalDecorations') as ReactElement;
  return wrapper.type as Wrapper;
}

async function renderDecorations(enabled: boolean) {
  vi.mocked(content.getSite).mockResolvedValue({
    ...fixtureSite,
    decoraties: {...fixtureSite.decoraties, enabled},
  });
  const Wrapper = findWrapper();
  render(await Wrapper({children: <p>pagina</p>}));
}

describe('MainSiteLayout seasonal decorations', () => {
  it('renders the decorations when decoraties.enabled is true', async () => {
    await renderDecorations(true);

    expect(screen.getByTestId('snowfall')).toBeInTheDocument();
    expect(screen.getByTestId('seasonal-styles')).toBeInTheDocument();
    expect(screen.getByText('pagina')).toBeInTheDocument();
  });

  it('renders no decorations when decoraties.enabled is false', async () => {
    await renderDecorations(false);

    expect(screen.queryByTestId('snowfall')).not.toBeInTheDocument();
    expect(screen.queryByTestId('seasonal-styles')).not.toBeInTheDocument();
    expect(screen.getByText('pagina')).toBeInTheDocument();
  });
});
