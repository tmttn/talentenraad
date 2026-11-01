import {render, screen} from '@testing-library/react';
import {Card} from '../../../app/components/ui/card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('applies default variant by default', () => {
      const {container} = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'shadow-base');
    });

    it('applies elevated variant', () => {
      const {container} = render(<Card variant='elevated'>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'shadow-elevated');
    });

    it('applies bordered variant', () => {
      const {container} = render(<Card variant='bordered'>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'border', 'border-gray-200');
    });

    it('applies ghost variant', () => {
      const {container} = render(<Card variant='ghost'>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gray-50');
    });
  });

  describe('padding', () => {
    it('applies md padding by default', () => {
      const {container} = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-component-md');
    });

    it('applies no padding', () => {
      const {container} = render(<Card padding='none'>Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('p-component-sm', 'p-component-md', 'p-component-lg');
    });

    it('applies sm padding', () => {
      const {container} = render(<Card padding='sm'>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-component-sm');
    });

    it('applies lg padding', () => {
      const {container} = render(<Card padding='lg'>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-component-lg');
    });
  });

  describe('hover', () => {
    it('does not apply hover styles by default', () => {
      const {container} = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('hover:shadow-elevated', 'transition-shadow');
    });

    it('applies hover styles when hover is true', () => {
      const {container} = render(<Card hover>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-elevated', 'transition-shadow', 'duration-base');
    });
  });

  it('has rounded-card class (design token)', () => {
    const {container} = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('rounded-card');
  });

  it('accepts custom className', () => {
    const {container} = render(<Card className='custom-class'>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  describe('contour variants', () => {
    it('uses the contour outline, hard shadow and tile radius', () => {
      const {container} = render(<Card variant='contour'>Content</Card>);
      expect(container.firstChild).toHaveClass('contour-sm', 'shadow-hard-md', 'rounded-tile');
      expect(container.firstChild).not.toHaveClass('rounded-card');
    });

    it('uses the thicker outline and panel radius for contour-lg', () => {
      const {container} = render(<Card variant='contour-lg'>Content</Card>);
      expect(container.firstChild).toHaveClass('contour', 'shadow-hard-lg', 'rounded-panel');
    });

    it('lifts on hover instead of growing a soft shadow', () => {
      const {container} = render(<Card variant='contour' hover>Content</Card>);
      expect(container.firstChild).toHaveClass('hover:shadow-hard-lg');
      expect(container.firstChild).not.toHaveClass('hover:shadow-elevated');
    });
  });

  it('renders as a link when href is given', () => {
    render(<Card href='/ergens'>Link content</Card>);
    expect(screen.getByRole('link', {name: 'Link content'})).toHaveAttribute('href', '/ergens');
  });
});
