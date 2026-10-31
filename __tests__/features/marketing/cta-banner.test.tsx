import {render} from '@testing-library/react';
import {CtaBanner as CTABanner} from '../../../app/features/marketing/cta-banner';

describe('CTABanner', () => {
  it('renders section element', () => {
    const {container} = render(<CTABanner />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  describe('variants', () => {
    it('applies default variant styles', () => {
      const {container} = render(<CTABanner />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gray-900');
    });

    it('applies accent variant styles', () => {
      const {container} = render(<CTABanner variant='accent' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-r');
    });

    it('applies light variant styles', () => {
      const {container} = render(<CTABanner variant='light' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gray-100');
    });

    it('falls back to default for unknown variant', () => {
      // @ts-expect-error Testing invalid variant
      const {container} = render(<CTABanner variant='unknown' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gray-900');
    });
  });

  it('has padding classes', () => {
    const {container} = render(<CTABanner />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-12', 'md:py-16');
  });
});

describe('CTABanner children', () => {
  it('renders children content', () => {
    const {getByText} = render(<CTABanner>
      <h2>CTA Title</h2>
      <p>CTA description</p>
    </CTABanner>);
    expect(getByText('CTA Title')).toBeInTheDocument();
    expect(getByText('CTA description')).toBeInTheDocument();
  });

  it('renders without children', () => {
    const {container} = render(<CTABanner />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});
