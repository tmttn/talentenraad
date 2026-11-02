import {render, screen, fireEvent} from '@testing-library/react';
import {
  ErrorPage,
  NotFoundPage,
  ServerErrorPage,
  AdminErrorPage,
} from '../../app/components/error-pages';

// Mock window.history.back
const mockHistoryBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: {back: mockHistoryBack},
});

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error code and title', () => {
    render(<ErrorPage
      code='404'
      title='Test Title'
      description='Test description'
    />);

    expect(screen.getByText('Foutcode 404')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Test Title');
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders home button by default', () => {
    render(<ErrorPage
      code='404'
      title='Test'
      description='Test'
    />);

    expect(screen.getByRole('link', {name: /naar home/i})).toHaveAttribute('href', '/');
  });

  it('renders back button by default', () => {
    render(<ErrorPage
      code='404'
      title='Test'
      description='Test'
    />);

    const backButton = screen.getByRole('button', {name: /ga terug/i});
    fireEvent.click(backButton);

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  it('hides home button when showHomeButton is false', () => {
    render(<ErrorPage
      code='404'
      title='Test'
      description='Test'
      showHomeButton={false}
    />);

    expect(screen.queryByRole('link', {name: /naar home/i})).not.toBeInTheDocument();
  });

  it('hides back button when showBackButton is false', () => {
    render(<ErrorPage
      code='404'
      title='Test'
      description='Test'
      showBackButton={false}
    />);

    expect(screen.queryByRole('button', {name: /ga terug/i})).not.toBeInTheDocument();
  });

  it('shows retry button when showRetryButton and onRetry are provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorPage
      code='500'
      title='Test'
      description='Test'
      showRetryButton
      onRetry={mockRetry}
    />);

    const retryButton = screen.getByRole('button', {name: /probeer opnieuw/i});
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('uses the contour style: a speech bubble and contour buttons', () => {
    render(<ErrorPage code='404' title='Test' description='Test' />);
    expect(screen.getByRole('heading', {level: 1}).closest('.contour')).not.toBeNull();
    expect(screen.getByRole('link', {name: /Naar home/})).toHaveClass('contour-sm', 'rounded-control');
    expect(screen.getByRole('button', {name: /Ga terug/})).toHaveClass('contour-sm');
  });

  it('renders contact link', () => {
    render(<ErrorPage
      code='404'
      title='Test'
      description='Test'
    />);

    expect(screen.getByRole('link', {name: /laat het ons weten/i})).toHaveAttribute('href', '/contact');
  });
});

describe('NotFoundPage', () => {
  it('renders 404 page with correct content', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('Foutcode 404')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Oeps, verdwaald!');
    expect(screen.getByRole('link', {name: /Naar home/})).toHaveAttribute('href', '/');
  });
});

describe('ServerErrorPage', () => {
  it('renders 500 page with correct content', () => {
    render(<ServerErrorPage />);

    expect(screen.getByText('Foutcode 500')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Oeps, kortsluiting!');
  });

  it('shows retry button when reset is provided', () => {
    const mockReset = vi.fn();
    render(<ServerErrorPage reset={mockReset} />);

    const retryButton = screen.getByRole('button', {name: /probeer opnieuw/i});
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when reset is not provided', () => {
    render(<ServerErrorPage />);

    expect(screen.queryByRole('button', {name: /probeer opnieuw/i})).not.toBeInTheDocument();
  });
});

describe('AdminErrorPage', () => {
  it('renders error code and title', () => {
    render(<AdminErrorPage
      code='500'
      title='Admin Error'
      description='Admin error description'
    />);

    expect(screen.getByText('Fout 500')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Admin Error');
    expect(screen.getByText('Admin error description')).toBeInTheDocument();
  });

  it('renders dashboard link', () => {
    render(<AdminErrorPage
      code='500'
      title='Test'
      description='Test'
    />);

    expect(screen.getByRole('link', {name: /dashboard/i})).toHaveAttribute('href', '/admin');
  });

  it('shows retry button when showRetry and onRetry are provided', () => {
    const mockRetry = vi.fn();
    render(<AdminErrorPage
      code='500'
      title='Test'
      description='Test'
      showRetry
      onRetry={mockRetry}
    />);

    const retryButton = screen.getByRole('button', {name: /opnieuw/i});
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetry is false', () => {
    render(<AdminErrorPage
      code='500'
      title='Test'
      description='Test'
      showRetry={false}
    />);

    expect(screen.queryByRole('button', {name: /opnieuw/i})).not.toBeInTheDocument();
  });
});
