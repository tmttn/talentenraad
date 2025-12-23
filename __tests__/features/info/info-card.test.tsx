import {render, screen} from '@testing-library/react';
import {InfoCardInfo} from '../../../app/features/info/info-card';

// Mock the UI components
jest.mock('../../../app/components/ui', () => ({
  AnimatedLink: ({href, children}: {href: string; children: React.ReactNode}) => (
    <a href={href}>{children}</a>
  ),
  HeartIcon: () => <svg data-testid='icon-heart' />,
  UserIcon: () => <svg data-testid='icon-user' />,
  CalendarIcon: () => <svg data-testid='icon-calendar' />,
  StarIcon: () => <svg data-testid='icon-star' />,
  GiftIcon: () => <svg data-testid='icon-gift' />,
  SchoolIcon: () => <svg data-testid='icon-school' />,
  MoneyIcon: () => <svg data-testid='icon-money' />,
  ChatIcon: () => <svg data-testid='icon-chat' />,
  UsersIcon: () => <svg data-testid='icon-users' />,
  EmailIcon: () => <svg data-testid='icon-email' />,
  LocationIcon: () => <svg data-testid='icon-location' />,
  PhoneIcon: () => <svg data-testid='icon-phone' />,
}));

const InfoCard = InfoCardInfo.component;

describe('InfoCard', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test description text',
  };

  it('renders title and description', () => {
    render(<InfoCard {...defaultProps} />);
    expect(screen.getByRole('heading', {name: 'Test Title'})).toBeInTheDocument();
    expect(screen.getByText('Test description text')).toBeInTheDocument();
  });

  it('renders link when provided', () => {
    render(<InfoCard {...defaultProps} link='/test' />);
    const link = screen.getByRole('link', {name: 'Meer info'});
    expect(link).toHaveAttribute('href', '/test');
  });

  it('uses custom linkText when provided', () => {
    render(<InfoCard {...defaultProps} link='/test' linkText='Learn more' />);
    expect(screen.getByRole('link', {name: 'Learn more'})).toBeInTheDocument();
  });

  it('does not render link when not provided', () => {
    const {container} = render(<InfoCard {...defaultProps} />);
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });

  describe('icons', () => {
    it('renders with default star icon', () => {
      const {container} = render(<InfoCard {...defaultProps} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    const iconTypes: Array<'heart' | 'users' | 'calendar' | 'star' | 'gift' | 'school' | 'money' | 'chat' | 'team' | 'email' | 'location' | 'phone'> = [
      'heart', 'users', 'calendar', 'star', 'gift', 'school', 'money', 'chat', 'team', 'email', 'location', 'phone',
    ];

    it.each(iconTypes)('renders with %s icon', icon => {
      const {container} = render(<InfoCard {...defaultProps} icon={icon} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      const {container} = render(<InfoCard {...defaultProps} />);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white');
    });

    it('applies primary variant styles', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='primary' />);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('applies secondary variant styles', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='secondary' />);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('applies accent variant styles', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='accent' />);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('applies gradient variant styles', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='gradient' />);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    it('renders decorative elements for non-default variants', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='primary' />);
      const decorativeElements = container.querySelectorAll(String.raw`.bg-white\/10, .bg-white\/5`);
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('does not render decorative elements for default variant', () => {
      const {container} = render(<InfoCard {...defaultProps} variant='default' />);
      const card = container.firstChild as Element;
      const decorativeElements = card?.querySelectorAll('.absolute');
      expect(decorativeElements?.length).toBe(0);
    });
  });
});

describe('InfoCardInfo', () => {
  it('exports correct component info', () => {
    expect(InfoCardInfo.name).toBe('InfoCard');
    expect(InfoCardInfo.component).toBeDefined();
    expect(InfoCardInfo.inputs).toBeInstanceOf(Array);
  });

  it('has required inputs for title and description', () => {
    const titleInput = InfoCardInfo.inputs.find(i => i.name === 'title');
    const descriptionInput = InfoCardInfo.inputs.find(i => i.name === 'description');
    expect(titleInput?.required).toBe(true);
    expect(descriptionInput?.required).toBe(true);
  });
});
