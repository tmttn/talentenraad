import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {toast} from 'sonner';
import {FeedbackLink} from '../../../app/components/feedback/feedback-link';

vi.mock('sonner', () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const fetchMock = vi.fn();

const json = (body: unknown) => Promise.resolve({json: () => Promise.resolve(body)});

const posts = () => fetchMock.mock.calls.filter(([url]) => url === '/api/feedback');

const fillAndSend = () => {
  fireEvent.click(screen.getByRole('radio', {name: '4 sterren'}));
  fireEvent.click(screen.getByRole('button', {name: 'Verstuur'}));
};

describe('FeedbackLink', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fetches a timing token only when the form opens', async () => {
    fetchMock.mockImplementation(() => json({token: 'tok'}));
    render(<FeedbackLink />);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Geef feedback'}));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/feedback/token', {cache: 'no-store'});
    });
  });

  it('waits out the minimum time before sending, then sends the token', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    fetchMock.mockImplementation((url: string) => (url === '/api/feedback/token' ? json({token: 'tok'}) : json({success: true, message: 'Bedankt voor je feedback!'})));
    render(<FeedbackLink />);
    fireEvent.click(screen.getByRole('button', {name: 'Geef feedback'}));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    fillAndSend();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(posts()).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    await waitFor(() => {
      expect(posts()).toHaveLength(1);
    });
    expect(JSON.parse((posts()[0][1] as {body: string}).body)).toMatchObject({rating: 4, formToken: 'tok'});
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Bedankt voor je feedback!');
    });
  });

  it('says so when no token can be fetched, instead of sending feedback that would be dropped', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    render(<FeedbackLink />);
    fireEvent.click(screen.getByRole('button', {name: 'Geef feedback'}));
    fillAndSend();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Feedback versturen lukt nu niet. Probeer het later opnieuw.');
    });
    expect(posts()).toHaveLength(0);
  });
});
