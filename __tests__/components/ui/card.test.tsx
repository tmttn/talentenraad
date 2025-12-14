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
			expect(card).toHaveClass('bg-white', 'shadow-md');
		});

		it('applies elevated variant', () => {
			const {container} = render(<Card variant='elevated'>Content</Card>);
			const card = container.firstChild;
			expect(card).toHaveClass('bg-white', 'shadow-lg');
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
			expect(card).toHaveClass('p-6');
		});

		it('applies no padding', () => {
			const {container} = render(<Card padding='none'>Content</Card>);
			const card = container.firstChild;
			expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
		});

		it('applies sm padding', () => {
			const {container} = render(<Card padding='sm'>Content</Card>);
			const card = container.firstChild;
			expect(card).toHaveClass('p-4');
		});

		it('applies lg padding', () => {
			const {container} = render(<Card padding='lg'>Content</Card>);
			const card = container.firstChild;
			expect(card).toHaveClass('p-8');
		});
	});

	describe('hover', () => {
		it('does not apply hover styles by default', () => {
			const {container} = render(<Card>Content</Card>);
			const card = container.firstChild;
			expect(card).not.toHaveClass('hover:shadow-lg', 'transition-shadow');
		});

		it('applies hover styles when hover is true', () => {
			const {container} = render(<Card hover>Content</Card>);
			const card = container.firstChild;
			expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow');
		});
	});

	it('has rounded-xl class', () => {
		const {container} = render(<Card>Content</Card>);
		const card = container.firstChild;
		expect(card).toHaveClass('rounded-xl');
	});

	it('accepts custom className', () => {
		const {container} = render(<Card className='custom-class'>Content</Card>);
		const card = container.firstChild;
		expect(card).toHaveClass('custom-class');
	});
});
