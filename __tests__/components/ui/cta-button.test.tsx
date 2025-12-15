import {render, screen} from '@testing-library/react';
import {CtaButton} from '../../../app/components/ui/cta-button';

describe('CtaButton', () => {
	it('renders with default props', () => {
		render(<CtaButton />);
		const link = screen.getByRole('link', {name: /klik hier/i});
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '#');
	});

	it('renders custom text', () => {
		render(<CtaButton text='Contact opnemen' />);
		expect(screen.getByRole('link', {name: /contact opnemen/i})).toBeInTheDocument();
	});

	it('renders custom href', () => {
		render(<CtaButton href='/contact' />);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', '/contact');
	});

	it('renders external href', () => {
		render(<CtaButton href='https://example.com' />);
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', 'https://example.com');
	});

	describe('variants', () => {
		it('applies primary variant by default', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('bg-primary', 'text-white');
		});

		it('applies secondary variant', () => {
			render(<CtaButton variant='secondary' />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('bg-white/10', 'text-white', 'border');
		});

		it('applies outline variant', () => {
			render(<CtaButton variant='outline' />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('bg-transparent', 'border-2', 'border-white', 'text-white');
		});

		it('applies white variant', () => {
			render(<CtaButton variant='white' />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('bg-white', 'text-gray-900');
		});
	});

	describe('sizes', () => {
		it('applies sm size', () => {
			render(<CtaButton size='sm' />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('py-2', 'px-4', 'text-sm');
		});

		it('applies md size by default', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('py-3', 'px-6', 'text-base');
		});

		it('applies lg size', () => {
			render(<CtaButton size='lg' />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('py-4', 'px-8', 'text-lg');
		});
	});

	describe('arrow', () => {
		it('shows arrow by default', () => {
			const {container} = render(<CtaButton />);
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});

		it('hides arrow when showArrow is false', () => {
			const {container} = render(<CtaButton showArrow={false} />);
			const svg = container.querySelector('svg');
			expect(svg).not.toBeInTheDocument();
		});

		it('applies correct arrow size for sm', () => {
			const {container} = render(<CtaButton size='sm' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-4', 'w-4');
		});

		it('applies correct arrow size for md', () => {
			const {container} = render(<CtaButton size='md' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-5', 'w-5');
		});

		it('applies correct arrow size for lg', () => {
			const {container} = render(<CtaButton size='lg' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-5', 'w-5');
		});
	});

	describe('base styles', () => {
		it('has inline-flex display', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center');
		});

		it('has font-semibold', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('font-semibold');
		});

		it('has rounded corners', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('rounded-lg');
		});

		it('has focus ring styles', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
		});

		it('has animation class', () => {
			render(<CtaButton />);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('cta-button');
		});
	});

	describe('combined props', () => {
		it('combines multiple props correctly', () => {
			render(
				<CtaButton
					text='Meer info'
					href='/info'
					variant='outline'
					size='lg'
					showArrow={false}
				/>,
			);
			const link = screen.getByRole('link', {name: 'Meer info'});
			expect(link).toHaveAttribute('href', '/info');
			expect(link).toHaveClass('bg-transparent', 'border-2', 'py-4', 'px-8');
		});
	});

	describe('styles injection', () => {
		it('injects button animation styles', () => {
			const {container} = render(<CtaButton />);
			const style = container.querySelector('style');
			expect(style).toBeInTheDocument();
			expect(style?.innerHTML).toContain('.cta-button');
			expect(style?.innerHTML).toContain('.cta-button-arrow');
		});
	});
});
