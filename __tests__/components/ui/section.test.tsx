import {render, screen} from '@testing-library/react';
import {Section} from '../../../app/components/ui/section';

describe('Section', () => {
	it('renders children', () => {
		render(<Section>Section content</Section>);
		expect(screen.getByText('Section content')).toBeInTheDocument();
	});

	it('renders title when provided', () => {
		render(<Section title='Test Title'>Content</Section>);
		expect(screen.getByRole('heading', {name: 'Test Title'})).toBeInTheDocument();
	});

	it('renders subtitle when provided', () => {
		render(<Section subtitle='Test Subtitle'>Content</Section>);
		expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
	});

	it('renders both title and subtitle', () => {
		render(
			<Section title='Title' subtitle='Subtitle'>
				Content
			</Section>,
		);
		expect(screen.getByRole('heading', {name: 'Title'})).toBeInTheDocument();
		expect(screen.getByText('Subtitle')).toBeInTheDocument();
	});

	describe('aria-labelledby', () => {
		it('generates id from title', () => {
			const {container} = render(<Section title='My Section'>Content</Section>);
			const section = container.querySelector('section');
			const heading = screen.getByRole('heading');
			expect(section).toHaveAttribute('aria-labelledby', 'section-my-section');
			expect(heading).toHaveAttribute('id', 'section-my-section');
		});

		it('uses custom titleId when provided', () => {
			const {container} = render(
				<Section title='My Section' titleId='custom-id'>
					Content
				</Section>,
			);
			const section = container.querySelector('section');
			const heading = screen.getByRole('heading');
			expect(section).toHaveAttribute('aria-labelledby', 'custom-id');
			expect(heading).toHaveAttribute('id', 'custom-id');
		});

		it('handles spaces in title for id generation', () => {
			const {container} = render(<Section title='My Long Title'>Content</Section>);
			const section = container.querySelector('section');
			expect(section).toHaveAttribute('aria-labelledby', 'section-my-long-title');
		});
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

		it('applies white text for dark variant title', () => {
			render(
				<Section variant='dark' title='Dark Title'>
					Content
				</Section>,
			);
			const heading = screen.getByRole('heading');
			expect(heading).toHaveClass('text-white');
		});

		it('applies gray text for dark variant subtitle', () => {
			render(
				<Section variant='dark' subtitle='Dark Subtitle'>
					Content
				</Section>,
			);
			expect(screen.getByText('Dark Subtitle')).toHaveClass('text-gray-300');
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

	describe('centerTitle', () => {
		it('centers title by default', () => {
			const {container} = render(<Section title='Title'>Content</Section>);
			const titleWrapper = container.querySelector('.mb-10');
			expect(titleWrapper).toHaveClass('text-center');
		});

		it('does not center title when centerTitle is false', () => {
			const {container} = render(
				<Section title='Title' centerTitle={false}>
					Content
				</Section>,
			);
			const titleWrapper = container.querySelector('.mb-10');
			expect(titleWrapper).not.toHaveClass('text-center');
		});
	});

	it('accepts custom className', () => {
		const {container} = render(<Section className='custom-class'>Content</Section>);
		const section = container.querySelector('section');
		expect(section).toHaveClass('custom-class');
	});
});
