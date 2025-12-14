import {render, screen} from '@testing-library/react';
import {UnifiedCtaInfo} from '../../../app/features/marketing/unified-cta';

const UnifiedCTA = UnifiedCtaInfo.component;

describe('UnifiedCTA', () => {
	describe('full variant (default)', () => {
		it('renders title and subtitle', () => {
			render(<UnifiedCTA />);
			expect(screen.getByRole('heading', {name: /doe mee met de talentenraad/i})).toBeInTheDocument();
			expect(screen.getByText(/heb je vragen/i)).toBeInTheDocument();
		});

		it('renders primary button with default values', () => {
			render(<UnifiedCTA />);
			const link = screen.getByRole('link', {name: /neem contact op/i});
			expect(link).toHaveAttribute('href', '/contact');
		});

		it('renders secondary button when provided', () => {
			render(<UnifiedCTA secondaryButtonText='Secondary' secondaryButtonLink='/secondary' />);
			const link = screen.getByRole('link', {name: /secondary/i});
			expect(link).toHaveAttribute('href', '/secondary');
		});

		it('shows volunteer CTA card by default', () => {
			render(<UnifiedCTA />);
			expect(screen.getByText('Word vrijwilliger')).toBeInTheDocument();
		});

		it('shows contact CTA card by default', () => {
			render(<UnifiedCTA />);
			expect(screen.getByText('Vragen of ideeën?')).toBeInTheDocument();
		});

		it('hides newsletter CTA card by default', () => {
			render(<UnifiedCTA />);
			expect(screen.queryByText('Blijf op de hoogte')).not.toBeInTheDocument();
		});

		it('shows newsletter CTA card when enabled', () => {
			render(<UnifiedCTA showNewsletterCTA />);
			expect(screen.getByText('Blijf op de hoogte')).toBeInTheDocument();
		});

		it('hides volunteer CTA when disabled', () => {
			render(<UnifiedCTA showVolunteerCTA={false} />);
			expect(screen.queryByText('Word vrijwilliger')).not.toBeInTheDocument();
		});

		it('hides contact CTA when disabled', () => {
			render(<UnifiedCTA showContactCTA={false} />);
			expect(screen.queryByText('Vragen of ideeën?')).not.toBeInTheDocument();
		});
	});

	describe('compact variant', () => {
		it('renders in compact layout', () => {
			const {container} = render(<UnifiedCTA variant='compact' />);
			const section = container.querySelector('section');
			expect(section).toHaveAttribute('aria-labelledby', 'cta-title-compact');
		});

		it('renders title and subtitle', () => {
			render(<UnifiedCTA variant='compact' title='Compact Title' subtitle='Compact subtitle' />);
			expect(screen.getByRole('heading', {name: 'Compact Title'})).toBeInTheDocument();
			expect(screen.getByText('Compact subtitle')).toBeInTheDocument();
		});

		it('renders action buttons', () => {
			render(<UnifiedCTA variant='compact' primaryButtonText='Primary' primaryButtonLink='/primary' />);
			expect(screen.getByRole('link', {name: /primary/i})).toBeInTheDocument();
		});
	});

	describe('minimal variant', () => {
		it('renders in minimal layout', () => {
			const {container} = render(<UnifiedCTA variant='minimal' />);
			const section = container.querySelector('section');
			expect(section).toHaveAttribute('aria-labelledby', 'cta-title-minimal');
		});

		it('renders title only (no subtitle)', () => {
			render(<UnifiedCTA variant='minimal' title='Minimal Title' subtitle='Should not show feature cards' />);
			expect(screen.getByRole('heading', {name: 'Minimal Title'})).toBeInTheDocument();
			// Feature cards should not be rendered in minimal variant
			expect(screen.queryByText('Word vrijwilliger')).not.toBeInTheDocument();
		});

		it('renders action buttons', () => {
			render(
				<UnifiedCTA
					variant='minimal'
					primaryButtonText='Action 1'
					primaryButtonLink='/action1'
					secondaryButtonText='Action 2'
					secondaryButtonLink='/action2'
				/>,
			);
			expect(screen.getByRole('link', {name: /action 1/i})).toBeInTheDocument();
			expect(screen.getByRole('link', {name: /action 2/i})).toBeInTheDocument();
		});
	});

	describe('custom props', () => {
		it('uses custom title', () => {
			render(<UnifiedCTA title='Custom Title' />);
			expect(screen.getByRole('heading', {name: 'Custom Title'})).toBeInTheDocument();
		});

		it('uses custom subtitle', () => {
			render(<UnifiedCTA subtitle='Custom subtitle text' />);
			expect(screen.getByText('Custom subtitle text')).toBeInTheDocument();
		});

		it('uses custom primary button text and link', () => {
			render(<UnifiedCTA primaryButtonText='Custom Button' primaryButtonLink='/custom' />);
			const link = screen.getByRole('link', {name: /custom button/i});
			expect(link).toHaveAttribute('href', '/custom');
		});
	});

	it('injects CTA animation styles', () => {
		const {container} = render(<UnifiedCTA />);
		const style = container.querySelector('style');
		expect(style).toBeInTheDocument();
		expect(style?.textContent).toContain('.cta-button');
	});
});

describe('UnifiedCtaInfo', () => {
	it('exports correct component info', () => {
		expect(UnifiedCtaInfo.name).toBe('UnifiedCTA');
		expect(UnifiedCtaInfo.component).toBeDefined();
		expect(UnifiedCtaInfo.inputs).toBeInstanceOf(Array);
	});
});
