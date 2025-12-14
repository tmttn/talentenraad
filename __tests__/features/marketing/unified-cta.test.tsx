import {render} from '@testing-library/react';
import {UnifiedCtaInfo} from '../../../app/features/marketing/unified-cta';

const UnifiedCTA = UnifiedCtaInfo.component;

describe('UnifiedCTA', () => {
	describe('variant styles', () => {
		it('renders full variant with dark gradient by default', () => {
			const {container} = render(<UnifiedCTA />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gradient-to-br', 'from-gray-900', 'to-gray-800');
		});

		it('renders compact variant with primary gradient', () => {
			const {container} = render(<UnifiedCTA variant='compact' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gradient-to-r', 'from-brand-primary-500', 'to-brand-primary-600');
		});

		it('renders minimal variant with solid dark background', () => {
			const {container} = render(<UnifiedCTA variant='minimal' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('bg-gray-900');
		});
	});

	describe('container styles', () => {
		it('uses max-w-5xl for full variant', () => {
			const {container} = render(<UnifiedCTA variant='full' />);
			const innerDiv = container.querySelector('section > div');
			expect(innerDiv).toHaveClass('max-w-5xl');
		});

		it('uses max-w-4xl for compact variant', () => {
			const {container} = render(<UnifiedCTA variant='compact' />);
			const innerDiv = container.querySelector('section > div');
			expect(innerDiv).toHaveClass('max-w-4xl');
		});

		it('uses max-w-4xl and text-center for minimal variant', () => {
			const {container} = render(<UnifiedCTA variant='minimal' />);
			const innerDiv = container.querySelector('section > div');
			expect(innerDiv).toHaveClass('max-w-4xl', 'text-center');
		});
	});

	describe('children', () => {
		it('renders children content', () => {
			const {getByText} = render(
				<UnifiedCTA>
					<h2>Custom Title</h2>
					<p>Custom content</p>
				</UnifiedCTA>,
			);
			expect(getByText('Custom Title')).toBeInTheDocument();
			expect(getByText('Custom content')).toBeInTheDocument();
		});

		it('renders without children', () => {
			const {container} = render(<UnifiedCTA />);
			const section = container.querySelector('section');
			expect(section).toBeInTheDocument();
		});
	});
});

describe('UnifiedCtaInfo', () => {
	it('exports correct component info', () => {
		expect(UnifiedCtaInfo.name).toBe('UnifiedCTA');
		expect(UnifiedCtaInfo.component).toBeDefined();
		expect(UnifiedCtaInfo.inputs).toBeInstanceOf(Array);
	});

	it('has canHaveChildren enabled', () => {
		expect(UnifiedCtaInfo.canHaveChildren).toBe(true);
	});

	it('only has variant input', () => {
		expect(UnifiedCtaInfo.inputs).toHaveLength(1);
		expect(UnifiedCtaInfo.inputs[0].name).toBe('variant');
	});
});
