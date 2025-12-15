import {render, screen} from '@testing-library/react';
import {Section} from '../../../app/components/ui/section';

describe('Section', () => {
	it('renders children', () => {
		render(<Section>Section content</Section>);
		expect(screen.getByText('Section content')).toBeInTheDocument();
	});

	describe('variants', () => {
		it('applies default variant by default', () => {
			const {container} = render(<Section>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-white');
		});

		it('applies gray variant', () => {
			const {container} = render(<Section variant='gray'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-50');
		});

		it('applies dark variant', () => {
			const {container} = render(<Section variant='dark'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-900');
		});
	});

	describe('sizes', () => {
		it('applies lg size by default', () => {
			const {container} = render(<Section>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-16', 'px-6');
		});

		it('applies sm size', () => {
			const {container} = render(<Section size='sm'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-8', 'px-4');
		});

		it('applies md size', () => {
			const {container} = render(<Section size='md'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-12', 'px-6');
		});

		it('applies xl size', () => {
			const {container} = render(<Section size='xl'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-24', 'px-6');
		});
	});

	it('accepts custom className', () => {
		const {container} = render(<Section className='custom-class'>Content</Section>);
		const section = container.querySelector('section');
		expect(section).toHaveClass('custom-class');
	});
});
