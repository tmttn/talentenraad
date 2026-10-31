import {render, screen, fireEvent} from '@testing-library/react';
import GlobalError from '../../app/global-error';

describe('GlobalError', () => {
  const mockReset = vi.fn();

  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
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

  it('logs the error to the console', () => {
    const error = new Error('Test error');
    render(<GlobalError error={error} reset={mockReset} />);

    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('logs an error that has a digest', () => {
    const error = Object.assign(new Error('Test error'), {digest: 'abc123'});
    render(<GlobalError error={error} reset={mockReset} />);

    expect(consoleError).toHaveBeenCalledWith(error);
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
