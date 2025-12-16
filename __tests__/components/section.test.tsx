import {render, screen} from '@testing-library/react';
import {SectionInfo} from '../../app/components/section';

// Get the Section component from the info export
const Section = SectionInfo.component;

describe('Section', () => {
	it('renders children', () => {
		render(
			<Section>
				<div data-testid='child'>Child Content</div>
			</Section>,
		);

		expect(screen.getByTestId('child')).toBeInTheDocument();
		expect(screen.getByText('Child Content')).toBeInTheDocument();
	});

	describe('background variants', () => {
		it('renders white background by default', () => {
			const {container} = render(<Section>Content</Section>);
			expect(container.querySelector('.bg-white')).toBeInTheDocument();
		});

		it('renders light background', () => {
			const {container} = render(<Section background='light'>Content</Section>);
			expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
		});

		it('renders dark background with white text', () => {
			const {container} = render(<Section background='dark'>Content</Section>);
			expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
			expect(container.querySelector('.text-white')).toBeInTheDocument();
		});

		it('renders accent background', () => {
			const {container} = render(<Section background='accent'>Content</Section>);
			expect(container.querySelector('.bg-primary')).toBeInTheDocument();
		});

		it('renders secondary background', () => {
			const {container} = render(<Section background='secondary'>Content</Section>);
			expect(container.querySelector('.bg-secondary')).toBeInTheDocument();
		});

		it('renders tertiary background', () => {
			const {container} = render(<Section background='tertiary'>Content</Section>);
			expect(container.querySelector('.bg-accent')).toBeInTheDocument();
		});

		it('renders gradient background', () => {
			const {container} = render(<Section background='gradient'>Content</Section>);
			expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
		});
	});

	describe('size variants', () => {
		it('renders medium size by default', () => {
			const {container} = render(<Section>Content</Section>);
			expect(container.querySelector('.py-20')).toBeInTheDocument();
		});

		it('renders small size', () => {
			const {container} = render(<Section size='small'>Content</Section>);
			expect(container.querySelector('.py-12')).toBeInTheDocument();
		});

		it('renders large size', () => {
			const {container} = render(<Section size='large'>Content</Section>);
			expect(container.querySelector('.py-28')).toBeInTheDocument();
		});
	});

	describe('width variants', () => {
		it('renders default width by default', () => {
			const {container} = render(<Section>Content</Section>);
			expect(container.querySelector('.max-w-6xl')).toBeInTheDocument();
		});

		it('renders narrow width', () => {
			const {container} = render(<Section width='narrow'>Content</Section>);
			expect(container.querySelector('.max-w-3xl')).toBeInTheDocument();
		});

		it('renders wide width', () => {
			const {container} = render(<Section width='wide'>Content</Section>);
			expect(container.querySelector('.max-w-7xl')).toBeInTheDocument();
		});

		it('renders full width', () => {
			const {container} = render(<Section width='full'>Content</Section>);
			expect(container.querySelector('.max-w-full')).toBeInTheDocument();
		});
	});

	describe('alignment', () => {
		it('renders centered by default', () => {
			const {container} = render(<Section>Content</Section>);
			expect(container.querySelector('.text-center')).toBeInTheDocument();
		});

		it('renders left-aligned when specified', () => {
			const {container} = render(<Section align='left'>Content</Section>);
			expect(container.querySelector('.text-center')).not.toBeInTheDocument();
		});
	});

	describe('decorations', () => {
		it('renders no decoration by default', () => {
			const {container} = render(<Section>Content</Section>);
			expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
		});

		it('renders dots decoration', () => {
			const {container} = render(<Section decoration='dots'>Content</Section>);
			expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
			expect(container.querySelector('pattern')).toBeInTheDocument();
		});

		it('renders waves decoration', () => {
			const {container} = render(<Section decoration='waves'>Content</Section>);
			expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
			expect(container.querySelector('path')).toBeInTheDocument();
		});

		it('renders circles decoration', () => {
			const {container} = render(<Section decoration='circles'>Content</Section>);
			expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
			expect(container.querySelector('.rounded-full')).toBeInTheDocument();
		});
	});

	it('has correct SectionInfo export properties', () => {
		expect(SectionInfo.name).toBe('Section');
		expect(SectionInfo.component).toBeDefined();
		expect(SectionInfo.canHaveChildren).toBe(true);
		expect(SectionInfo.inputs).toBeDefined();
		expect(SectionInfo.inputs.length).toBeGreaterThan(0);
	});
});
