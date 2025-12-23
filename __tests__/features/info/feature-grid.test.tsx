import {render, screen} from '@testing-library/react';
import {FeatureGridInfo} from '../../../app/features/info/feature-grid';

// Mock the UI components
jest.mock('../../../app/components/ui', () => ({
  AnimatedLink: ({href, children}: {href: string; children: React.ReactNode}) => (
    <a href={href}>{children}</a>
  ),
  CalendarIcon: () => <svg data-testid='icon-calendar' />,
  HeartIcon: () => <svg data-testid='icon-heart' />,
  UsersIcon: () => <svg data-testid='icon-users' />,
  StarIcon: () => <svg data-testid='icon-star' />,
  MoneyIcon: () => <svg data-testid='icon-money' />,
  GiftIcon: () => <svg data-testid='icon-gift' />,
}));

const FeatureGrid = FeatureGridInfo.component;

describe('FeatureGrid', () => {
  const sampleFeatures = [
    {icon: 'calendar', title: 'Feature 1', description: 'Description 1'},
    {
      icon: 'heart', title: 'Feature 2', description: 'Description 2', link: '/feature-2',
    },
  ];

  it('renders features with title and description', () => {
    render(<FeatureGrid features={sampleFeatures} />);
    expect(screen.getByRole('heading', {level: 3, name: 'Feature 1'})).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: 'Feature 2'})).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders link when feature has link', () => {
    render(<FeatureGrid features={sampleFeatures} />);
    const link = screen.getByRole('link', {name: 'Meer info'});
    expect(link).toHaveAttribute('href', '/feature-2');
  });

  it('does not render link when feature has no link', () => {
    render(<FeatureGrid features={[sampleFeatures[0]]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('returns null with empty features array', () => {
    const {container} = render(<FeatureGrid features={[]} />);
    expect(container.firstChild).toBeNull();
  });

  describe('icons', () => {
    const iconTypes = ['calendar', 'heart', 'users', 'star', 'money', 'gift'];

    it.each(iconTypes)('renders %s icon', icon => {
      const features = [{icon, title: 'Test', description: 'Test'}];
      const {container} = render(<FeatureGrid features={features} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('falls back to star icon for unknown icon type', () => {
      const features = [{icon: 'unknown', title: 'Test', description: 'Test'}];
      const {container} = render(<FeatureGrid features={features} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('columns', () => {
    it('uses 3 columns by default', () => {
      const {container} = render(<FeatureGrid features={sampleFeatures} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('uses 2 columns when specified', () => {
      const {container} = render(<FeatureGrid features={sampleFeatures} columns={2} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2');
      expect(grid).not.toHaveClass('lg:grid-cols-3');
    });
  });
});

describe('FeatureGridInfo', () => {
  it('exports correct component info', () => {
    expect(FeatureGridInfo.name).toBe('FeatureGrid');
    expect(FeatureGridInfo.component).toBeDefined();
    expect(FeatureGridInfo.inputs).toBeInstanceOf(Array);
  });
});
