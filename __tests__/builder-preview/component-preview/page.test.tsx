import {render, screen} from '@testing-library/react';
import ComponentPreviewIndexPage from '../../../app/(builder-preview)/component-preview/page';

describe('ComponentPreviewIndexPage', () => {
  it('renders the page title', () => {
    render(<ComponentPreviewIndexPage />);

    expect(screen.getByRole('heading', {name: /builder.io component previews/i})).toBeInTheDocument();
  });

  it('renders component categories', () => {
    render(<ComponentPreviewIndexPage />);

    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Activiteiten')).toBeInTheDocument();
  });

  it('renders component links', () => {
    render(<ComponentPreviewIndexPage />);

    const heroLink = screen.getByRole('link', {name: /hero/i});
    expect(heroLink).toHaveAttribute('href', '/component-preview/hero');

    const ctaLink = screen.getByRole('link', {name: /cta banner/i});
    expect(ctaLink).toHaveAttribute('href', '/component-preview/cta-banner');
  });

  it('displays preview URL format info', () => {
    render(<ComponentPreviewIndexPage />);

    expect(screen.getByText('Preview URL Formaat')).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/your-site.com\/component-preview/)).toBeInTheDocument();
  });

  it('displays Builder.io configuration instructions', () => {
    render(<ComponentPreviewIndexPage />);

    expect(screen.getByText('Builder.io Configuratie')).toBeInTheDocument();
    expect(screen.getByText(/Ga naar Builder.io/)).toBeInTheDocument();
  });

  it('renders all component categories from the list', () => {
    render(<ComponentPreviewIndexPage />);

    // Check that all major categories are rendered
    const categories = ['Marketing', 'Info', 'Activiteiten', 'Nieuws', 'Team', 'Contact', 'FAQ', 'Dashboard', 'Layout', 'UI', 'Decoratie'];

    for (const category of categories) {
      expect(screen.getByText(category, {selector: 'h2'})).toBeInTheDocument();
    }
  });

  it('renders component slugs in preview paths', () => {
    render(<ComponentPreviewIndexPage />);

    // Check for specific component preview paths
    expect(screen.getByText('/component-preview/hero')).toBeInTheDocument();
    expect(screen.getByText('/component-preview/contact-form')).toBeInTheDocument();
    expect(screen.getByText('/component-preview/faq')).toBeInTheDocument();
  });
});
