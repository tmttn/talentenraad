import {render, screen} from '@testing-library/react';
import {AnimatedLink} from '../../../app/components/ui/animated-link';

describe('AnimatedLink', () => {
	it('renders with children and href', () => {
		render(<AnimatedLink href='/test'>Click me</AnimatedLink>);
		const link = screen.getByRole('link', {name: /click me/i});
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/test');
	});

	it('shows arrow by default', () => {
		const {container} = render(<AnimatedLink href='/test'>Link</AnimatedLink>);
		const arrow = container.querySelector('.animated-link-arrow');
		expect(arrow).toBeInTheDocument();
	});

	it('hides arrow when showArrow is false', () => {
		const {container} = render(
			<AnimatedLink href='/test' showArrow={false}>
				Link
			</AnimatedLink>,
		);
		const arrow = container.querySelector('.animated-link-arrow');
		expect(arrow).not.toBeInTheDocument();
	});

	it('renders left arrow when arrowDirection is left', () => {
		const {container} = render(
			<AnimatedLink href='/test' arrowDirection='left'>
				Link
			</AnimatedLink>,
		);
		const link = container.querySelector('a');
		const arrow = container.querySelector('.animated-link-arrow');
		// Left arrow should come before text
		expect(arrow?.nextSibling?.textContent).toBe('Link');
	});

	it('renders right arrow by default (after text)', () => {
		const {container} = render(<AnimatedLink href='/test'>Link</AnimatedLink>);
		const arrow = container.querySelector('.animated-link-arrow');
		// Right arrow should come after text
		expect(arrow?.previousSibling?.textContent).toBe('Link');
	});

	describe('variants', () => {
		it('applies primary variant by default', () => {
			render(<AnimatedLink href='/test'>Link</AnimatedLink>);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-primary');
		});

		it('applies secondary variant', () => {
			render(
				<AnimatedLink href='/test' variant='secondary'>
					Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-secondary');
		});

		it('applies white variant', () => {
			render(
				<AnimatedLink href='/test' variant='white'>
					Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-white');
		});

		it('applies muted variant', () => {
			render(
				<AnimatedLink href='/test' variant='muted'>
					Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-gray-500');
		});
	});

	describe('sizes', () => {
		it('applies md size by default', () => {
			render(<AnimatedLink href='/test'>Link</AnimatedLink>);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-base');
		});

		it('applies sm size', () => {
			render(
				<AnimatedLink href='/test' size='sm'>
					Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-sm');
		});

		it('applies lg size', () => {
			render(
				<AnimatedLink href='/test' size='lg'>
					Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveClass('text-lg');
		});
	});

	describe('external links', () => {
		it('does not add external attributes by default', () => {
			render(<AnimatedLink href='/test'>Link</AnimatedLink>);
			const link = screen.getByRole('link');
			expect(link).not.toHaveAttribute('target');
			expect(link).not.toHaveAttribute('rel');
		});

		it('adds target and rel attributes for external links', () => {
			render(
				<AnimatedLink href='https://example.com' external>
					External Link
				</AnimatedLink>,
			);
			const link = screen.getByRole('link');
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});
	});

	it('accepts custom className', () => {
		render(
			<AnimatedLink href='/test' className='custom-class'>
				Link
			</AnimatedLink>,
		);
		const link = screen.getByRole('link');
		expect(link).toHaveClass('custom-class');
	});

	it('injects animation styles', () => {
		const {container} = render(<AnimatedLink href='/test'>Link</AnimatedLink>);
		const style = container.querySelector('style');
		expect(style).toBeInTheDocument();
		expect(style?.textContent).toContain('.animated-link');
	});
});
