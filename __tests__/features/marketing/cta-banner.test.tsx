import {render, screen} from '@testing-library/react';
import {CtaBannerInfo} from '../../../app/features/marketing/cta-banner';

const CTABanner = CtaBannerInfo.component;

describe('CTABanner', () => {
	const defaultProps = {
		title: 'Test CTA',
	};

	it('renders title', () => {
		render(<CTABanner {...defaultProps} />);
		expect(screen.getByRole('heading', {name: 'Test CTA'})).toBeInTheDocument();
	});

	it('renders subtitle when provided', () => {
		render(<CTABanner {...defaultProps} subtitle='Subtitle text' />);
		expect(screen.getByText('Subtitle text')).toBeInTheDocument();
	});

	it('renders button with default values', () => {
		render(<CTABanner {...defaultProps} />);
		const button = screen.getByRole('link', {name: /neem contact op/i});
		expect(button).toHaveAttribute('href', '/contact');
	});

	it('renders button with custom values', () => {
		render(<CTABanner {...defaultProps} buttonText='Click Here' buttonLink='/custom' />);
		const button = screen.getByRole('link', {name: /click here/i});
		expect(button).toHaveAttribute('href', '/custom');
	});

	it('does not render button when buttonText is empty', () => {
		render(<CTABanner {...defaultProps} buttonText='' buttonLink='/test' />);
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	describe('variants', () => {
		it('applies default variant styles', () => {
			const {container} = render(<CTABanner {...defaultProps} />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-900');
		});

		it('applies accent variant styles', () => {
			const {container} = render(<CTABanner {...defaultProps} variant='accent' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gradient-to-r');
		});

		it('applies light variant styles', () => {
			const {container} = render(<CTABanner {...defaultProps} variant='light' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-100');
		});

		it('falls back to default for unknown variant', () => {
			// @ts-expect-error Testing invalid variant
			const {container} = render(<CTABanner {...defaultProps} variant='unknown' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-900');
		});
	});

	it('has aria-labelledby attribute', () => {
		const {container} = render(<CTABanner {...defaultProps} />);
		const section = container.querySelector('section');
		expect(section).toHaveAttribute('aria-labelledby', 'cta-title');
	});

	it('injects CTA animation styles', () => {
		const {container} = render(<CTABanner {...defaultProps} />);
		const style = container.querySelector('style');
		expect(style).toBeInTheDocument();
		expect(style?.textContent).toContain('.cta-button');
	});
});

describe('CtaBannerInfo', () => {
	it('exports correct component info', () => {
		expect(CtaBannerInfo.name).toBe('CTABanner');
		expect(CtaBannerInfo.component).toBeDefined();
		expect(CtaBannerInfo.inputs).toBeInstanceOf(Array);
	});

	it('has required input for title', () => {
		const titleInput = CtaBannerInfo.inputs.find(i => i.name === 'title');
		expect(titleInput?.required).toBe(true);
	});
});
