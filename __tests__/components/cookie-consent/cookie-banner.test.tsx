import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CookieBanner} from '../../../app/components/cookie-consent/cookie-banner';
import {CookieConsentProvider} from '../../../app/components/cookie-consent/cookie-consent-context';

const store = new Map<string, string>();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  },
});

const renderBanner = () => render(<CookieConsentProvider>
  <CookieBanner />
</CookieConsentProvider>);

describe('CookieBanner (informational notice)', () => {
  beforeEach(() => {
    store.clear();
    vi.unstubAllEnvs();
  });

  it('renders the notice text and a link to the cookie policy', () => {
    renderBanner();

    expect(screen.getByText(/alleen strikt noodzakelijke opslag/)).toBeInTheDocument();
    expect(screen.getByText(/geen analyse of advertenties/)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /cookiebeleid/i})).toHaveAttribute('href', '/cookiebeleid');
  });

  it('has a single button and no accept/reject choice', () => {
    renderBanner();

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', {name: 'Begrepen'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Accepteren'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Weigeren'})).not.toBeInTheDocument();
  });

  it('hides on "Begrepen" and remembers it', async () => {
    const user = userEvent.setup();
    const {unmount} = renderBanner();

    await user.click(screen.getByRole('button', {name: 'Begrepen'}));

    expect(screen.queryByText(/alleen strikt noodzakelijke opslag/)).not.toBeInTheDocument();
    expect(store.get('cookie-consent')).toBeTruthy();

    unmount();
    renderBanner();
    expect(screen.queryByText(/alleen strikt noodzakelijke opslag/)).not.toBeInTheDocument();
  });

  it.each(['accepted', 'rejected', 'customized', 'iets onbekends'])('does not ask again for old stored value %s', value => {
    store.set('cookie-consent', value);
    store.set('cookie-preferences', '{"necessary":true,"analytics":true}');

    renderBanner();

    expect(screen.queryByText(/alleen strikt noodzakelijke opslag/)).not.toBeInTheDocument();
  });

  it('can be shown again via openPreferences', async () => {
    const {useCookieConsent} = await import('../../../app/components/cookie-consent/cookie-consent-context');
    store.set('cookie-consent', 'acknowledged');
    const user = userEvent.setup();
    function Reopen() {
      return <button type='button' onClick={useCookieConsent().openPreferences}>Heropen</button>;
    }

    render(<CookieConsentProvider>
      <Reopen />
      <CookieBanner />
    </CookieConsentProvider>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Heropen'}));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not crash on corrupt old preferences', () => {
    store.set('cookie-consent', 'accepted');
    store.set('cookie-preferences', 'invalid-json');

    expect(() => renderBanner()).not.toThrow();
  });

  it('mentions reCAPTCHA only when it is enabled', () => {
    const {unmount} = renderBanner();
    expect(screen.queryByText(/reCAPTCHA/)).not.toBeInTheDocument();
    unmount();

    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', 'site-key');
    renderBanner();
    expect(screen.getByText(/Google reCAPTCHA/)).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    renderBanner();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'cookie-banner-title');
  });
});
