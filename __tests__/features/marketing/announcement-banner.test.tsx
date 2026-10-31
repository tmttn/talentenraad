import {render, screen, fireEvent} from '@testing-library/react';
import {AnnouncementBanner} from '../../../app/features/marketing/announcement-banner';

describe('AnnouncementBanner', () => {
  it('renders the text', () => {
    render(<AnnouncementBanner tekst='Test announcement' type='info' />);

    expect(screen.getByText('Test announcement')).toBeInTheDocument();
  });

  it('renders no link without link prop', () => {
    render(<AnnouncementBanner tekst='Zonder link' type='info' />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a link with linkTekst when both are given', () => {
    render(<AnnouncementBanner tekst='Met link' type='info' link='/more-info' linkTekst='Lees verder' />);

    expect(screen.getByRole('link', {name: /lees verder/i})).toHaveAttribute('href', '/more-info');
  });

  it('renders no link when linkTekst is missing', () => {
    render(<AnnouncementBanner tekst='Met link' type='info' link='/more-info' />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each([
    ['info', 'bg-info-600'],
    ['waarschuwing', 'bg-warning-500'],
    ['belangrijk', 'bg-primary'],
  ] as const)('renders %s type with %s', (type, className) => {
    const {container} = render(<AnnouncementBanner tekst='Tekst' type={type} />);

    expect(container.querySelector('[role="alert"]')).toHaveClass(className);
  });

  it('can be dismissed', () => {
    const {container} = render(<AnnouncementBanner tekst='Dismissable' type='info' />);

    fireEvent.click(screen.getByRole('button', {name: /sluiten/i}));

    expect(container.firstChild).toBeNull();
  });

  it('has role alert for accessibility', () => {
    render(<AnnouncementBanner tekst='Alert' type='info' />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
