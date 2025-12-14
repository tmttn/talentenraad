import {render, screen} from '@testing-library/react';
import {HeroInfo} from '../../../app/features/marketing/hero';

const Hero = HeroInfo.component;

describe('Hero', () => {
	const defaultProps = {
		title: 'Welcome',
	};

	it('renders title', () => {
		render(<Hero {...defaultProps} />);
		expect(screen.getByRole('heading', {name: 'Welcome'})).toBeInTheDocument();
	});

	it('renders subtitle when provided', () => {
		render(<Hero {...defaultProps} subtitle='Subtitle text' />);
		expect(screen.getByText('Subtitle text')).toBeInTheDocument();
	});

	it('renders primary CTA with default values', () => {
		render(<Hero {...defaultProps} />);
		const ctaLink = screen.getByRole('link', {name: /bekijk activiteiten/i});
		expect(ctaLink).toHaveAttribute('href', '/kalender');
	});

	it('renders primary CTA with custom values', () => {
		render(<Hero {...defaultProps} ctaText='Click me' ctaLink='/custom' />);
		const ctaLink = screen.getByRole('link', {name: /click me/i});
		expect(ctaLink).toHaveAttribute('href', '/custom');
	});

	it('renders secondary CTA when provided', () => {
		render(<Hero {...defaultProps} secondaryCtaText='Contact' secondaryCtaLink='/contact' />);
		const secondaryCta = screen.getByRole('link', {name: /contact/i});
		expect(secondaryCta).toHaveAttribute('href', '/contact');
	});

	it('renders both CTAs when both are provided', () => {
		render(
			<Hero
				{...defaultProps}
				ctaText='Primary'
				ctaLink='/primary'
				secondaryCtaText='Secondary'
				secondaryCtaLink='/secondary'
			/>,
		);
		expect(screen.getByRole('link', {name: /primary/i})).toBeInTheDocument();
		expect(screen.getByRole('link', {name: /secondary/i})).toBeInTheDocument();
	});

	describe('variants', () => {
		it('renders centered variant by default', () => {
			const {container} = render(<Hero {...defaultProps} />);
			expect(container.querySelector('#hero-title')).toBeInTheDocument();
		});

		it('renders split variant', () => {
			const {container} = render(<Hero {...defaultProps} variant='split' />);
			expect(container.querySelector('#hero-title-split')).toBeInTheDocument();
		});

		it('renders default variant', () => {
			const {container} = render(<Hero {...defaultProps} variant='default' />);
			expect(container.querySelector('#hero-title')).toBeInTheDocument();
		});
	});

	describe('sizes', () => {
		it('applies medium size by default', () => {
			const {container} = render(<Hero {...defaultProps} />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-20', 'md:py-28');
		});

		it('applies compact size', () => {
			const {container} = render(<Hero {...defaultProps} size='compact' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-12', 'md:py-16');
		});

		it('applies small size', () => {
			const {container} = render(<Hero {...defaultProps} size='small' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-16', 'md:py-20');
		});

		it('applies large size', () => {
			const {container} = render(<Hero {...defaultProps} size='large' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-28', 'md:py-36');
		});
	});

	it('injects CTA animation styles', () => {
		const {container} = render(<Hero {...defaultProps} />);
		const style = container.querySelector('style');
		expect(style).toBeInTheDocument();
		expect(style?.textContent).toContain('.cta-button');
	});

	it('has aria-labelledby attribute', () => {
		const {container} = render(<Hero {...defaultProps} />);
		const section = container.querySelector('section');
		expect(section).toHaveAttribute('aria-labelledby', 'hero-title');
	});
});

describe('HeroInfo', () => {
	it('exports correct component info', () => {
		expect(HeroInfo.name).toBe('Hero');
		expect(HeroInfo.component).toBeDefined();
		expect(HeroInfo.inputs).toBeInstanceOf(Array);
	});

	it('has required input for title', () => {
		const titleInput = HeroInfo.inputs.find(i => i.name === 'title');
		expect(titleInput?.required).toBe(true);
	});
});
