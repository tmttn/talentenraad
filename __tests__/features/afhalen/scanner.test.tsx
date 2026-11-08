import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const push = vi.fn();
const lees = vi.fn();
vi.mock('next/navigation', () => ({useRouter: () => ({push})}));
vi.mock('../../../app/features/afhalen/qr-lezer', () => ({maakQrLezer: async () => lees}));

const {Scanner} = await import('../../../app/features/afhalen/scanner');

const token = 'AbCdEfGhIjKlMnOpQrSt_-';
const track = {stop: vi.fn()};
const stream = {active: true, getTracks: () => [track]};

beforeEach(() => {
  push.mockReset();
  lees.mockReset();
  track.stop.mockReset();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const startCamera = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', {name: 'Camera starten'}));
  });
};

describe('Scanner', () => {
  it('remembers the moment of this phone for links opened by the camera app', () => {
    render(<Scanner actie='pizzaverkoop' moment='vrijdag' siteUrl='https://talentenraad.be' />);

    expect(document.cookie).toContain('tr_afhaalmoment=pizzaverkoop/vrijdag');
  });

  it('opens the hand-over screen for a QR code of our own site and stops the camera', async () => {
    vi.stubGlobal('navigator', {mediaDevices: {getUserMedia: vi.fn().mockResolvedValue(stream)}});
    lees.mockResolvedValue(`https://talentenraad.be/b/${token}`);
    render(<Scanner actie='pizzaverkoop' moment='vrijdag' siteUrl='https://talentenraad.be' />);

    await startCamera();

    expect(push).toHaveBeenCalledWith(`/admin/afhalen/pizzaverkoop/vrijdag/${token}`);
    expect(track.stop).toHaveBeenCalled();
  });

  it('says so for a strange QR code and keeps scanning', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', {mediaDevices: {getUserMedia: vi.fn().mockResolvedValue(stream)}});
    lees.mockResolvedValueOnce('https://evil.example/b/x').mockResolvedValue(undefined);
    render(<Scanner actie='pizzaverkoop' moment='vrijdag' siteUrl='https://talentenraad.be' />);

    await startCamera();

    expect(screen.getByRole('status')).toHaveTextContent('Dit is geen afhaalcode van de Talentenraad.');
    expect(push).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(lees).toHaveBeenCalledTimes(2);
  });

  it('explains the way out when the camera cannot start', async () => {
    vi.stubGlobal('navigator', {mediaDevices: {getUserMedia: vi.fn().mockRejectedValue(new Error('NotAllowedError'))}});
    render(<Scanner actie='pizzaverkoop' moment='vrijdag' siteUrl='https://talentenraad.be' />);

    await startCamera();

    expect(screen.getByRole('status')).toHaveTextContent('De camera kan niet starten.');
    expect(screen.getByRole('button', {name: 'Opnieuw proberen'})).toBeInTheDocument();
  });

  it('also without mediaDevices (plain http)', async () => {
    vi.stubGlobal('navigator', {});
    render(<Scanner actie='pizzaverkoop' moment='vrijdag' siteUrl='https://talentenraad.be' />);

    await startCamera();

    expect(screen.getByRole('status')).toHaveTextContent('De camera kan niet starten.');
  });
});
