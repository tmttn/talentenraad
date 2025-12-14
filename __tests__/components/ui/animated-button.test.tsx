import {render, screen, fireEvent} from '@testing-library/react';
import {AnimatedButton} from '../../../app/components/ui/animated-button';

describe('AnimatedButton', () => {
	describe('as link (with href)', () => {
		it('renders as anchor when href is provided', () => {
			render(<AnimatedButton href='/test'>Click me</AnimatedButton>);
			const link = screen.getByRole('link', {name: /click me/i});
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('href', '/test');
		});

		it('shows arrow by default', () => {
			const {container} = render(<AnimatedButton href='/test'>Link</AnimatedButton>);
			const arrow = container.querySelector('.animated-button-arrow');
			expect(arrow).toBeInTheDocument();
		});

		it('hides arrow when showArrow is false', () => {
			const {container} = render(
				<AnimatedButton href='/test' showArrow={false}>
					Link
				</AnimatedButton>,
			);
			const arrow = container.querySelector('.animated-button-arrow');
			expect(arrow).not.toBeInTheDocument();
		});
	});

	describe('as button (without href)', () => {
		it('renders as button when href is not provided', () => {
			render(<AnimatedButton>Click me</AnimatedButton>);
			const button = screen.getByRole('button', {name: /click me/i});
			expect(button).toBeInTheDocument();
		});

		it('has type="button" by default', () => {
			render(<AnimatedButton>Click</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('type', 'button');
		});

		it('accepts type="submit"', () => {
			render(<AnimatedButton type='submit'>Submit</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('type', 'submit');
		});

		it('can be disabled', () => {
			render(<AnimatedButton disabled>Disabled</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
		});

		it('calls onClick when clicked', () => {
			const handleClick = jest.fn();
			render(<AnimatedButton onClick={handleClick}>Click</AnimatedButton>);
			const button = screen.getByRole('button');
			fireEvent.click(button);
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('does not call onClick when disabled', () => {
			const handleClick = jest.fn();
			render(
				<AnimatedButton onClick={handleClick} disabled>
					Click
				</AnimatedButton>,
			);
			const button = screen.getByRole('button');
			fireEvent.click(button);
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('variants', () => {
		it('applies primary variant by default', () => {
			render(<AnimatedButton>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-primary', 'text-white');
		});

		it('applies secondary variant', () => {
			render(<AnimatedButton variant='secondary'>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-white/10', 'text-white');
		});

		it('applies outline variant', () => {
			render(<AnimatedButton variant='outline'>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-transparent', 'border-primary', 'text-primary');
		});

		it('applies ghost variant', () => {
			render(<AnimatedButton variant='ghost'>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('bg-transparent', 'text-primary');
		});
	});

	describe('sizes', () => {
		it('applies md size by default', () => {
			render(<AnimatedButton>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('py-3', 'px-6', 'text-base');
		});

		it('applies sm size', () => {
			render(<AnimatedButton size='sm'>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('py-2', 'px-4', 'text-sm');
		});

		it('applies lg size', () => {
			render(<AnimatedButton size='lg'>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('py-4', 'px-8', 'text-lg');
		});
	});

	describe('fullWidth', () => {
		it('does not apply full width by default', () => {
			render(<AnimatedButton>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).not.toHaveClass('w-full');
		});

		it('applies full width when fullWidth is true', () => {
			render(<AnimatedButton fullWidth>Button</AnimatedButton>);
			const button = screen.getByRole('button');
			expect(button).toHaveClass('w-full');
		});
	});

	it('accepts custom className', () => {
		render(<AnimatedButton className='custom-class'>Button</AnimatedButton>);
		const button = screen.getByRole('button');
		expect(button).toHaveClass('custom-class');
	});

	it('injects animation styles', () => {
		const {container} = render(<AnimatedButton>Button</AnimatedButton>);
		const style = container.querySelector('style');
		expect(style).toBeInTheDocument();
		expect(style?.textContent).toContain('.animated-button');
	});
});
