import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import {fixtureSite} from '../fixtures/site';
import {SeasonalDecorationsServer, getSeasonalDecorationsConfig} from '../../app/components/seasonal-decorations-server';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));

vi.mock('../../app/components/seasonal-decorations-context', () => ({
  SeasonalDecorationsProvider: ({children, config}: {children: React.ReactNode; config: unknown}) => (
    <div data-testid='decorations-provider' data-config={JSON.stringify(config)}>
      {children}
    </div>
  ),
}));

vi.mock('../../app/components/seasonal-decorations', () => ({
  Snowfall: () => <div data-testid='snowfall'>Snowfall</div>,
  SeasonalStyles: () => <style data-testid='seasonal-styles' />,
  defaultSeasonalConfig: {
    enabled: false,
    season: 'none',
    decorations: {
      christmasLights: false,
      snowfall: false,
      icicles: false,
      gingerbreadMan: false,
      christmasBalls: false,
    },
  },
}));

describe('getSeasonalDecorationsConfig', () => {
  beforeEach(() => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('returns decoraties from site content', async () => {
    expect(await getSeasonalDecorationsConfig()).toEqual(fixtureSite.decoraties);
  });

  it('returns default config when the site cannot be read', async () => {
    vi.mocked(content.getSite).mockImplementation(() => {
      throw new Error('kapot');
    });

    const result = await getSeasonalDecorationsConfig();

    expect(result.enabled).toBe(false);
    expect(result.season).toBe('none');
  });
});

describe('SeasonalDecorationsServer', () => {
  beforeEach(() => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders children within provider', async () => {
    render(await SeasonalDecorationsServer({children: <div data-testid='child-content'>Child</div>}));

    expect(screen.getByTestId('decorations-provider')).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders Snowfall and SeasonalStyles', async () => {
    render(await SeasonalDecorationsServer({children: <div>Content</div>}));

    expect(screen.getByTestId('snowfall')).toBeInTheDocument();
    expect(screen.getByTestId('seasonal-styles')).toBeInTheDocument();
  });

  it('passes config to SeasonalDecorationsProvider', async () => {
    render(await SeasonalDecorationsServer({children: <div>Content</div>}));

    const provider = screen.getByTestId('decorations-provider');
    expect(JSON.parse(provider.dataset.config ?? '{}')).toEqual(fixtureSite.decoraties);
  });
});
