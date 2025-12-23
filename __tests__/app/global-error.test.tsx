import {render, screen, fireEvent} from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import GlobalError from '../../app/global-error';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

describe('GlobalError', () => {
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message in Dutch', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Er ging iets mis');
  });

  it('renders error code 500', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('captures exception with Sentry', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('captures exception with digest', () => {
    const error = Object.assign(new Error('Test error'), {digest: 'abc123'});
    render(<GlobalError error={error} reset={mockReset} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('renders home link', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByRole('link', {name: /naar homepagina/i})).toHaveAttribute('href', '/');
  });

  it('calls reset when retry button is clicked', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    fireEvent.click(screen.getByRole('button', {name: /probeer opnieuw/i}));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders contact link', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByRole('link', {name: /contact/i})).toHaveAttribute('href', '/contact');
  });
});
