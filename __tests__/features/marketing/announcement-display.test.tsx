import {render, screen, fireEvent} from '@testing-library/react';
import {AnnouncementDisplay, type AnnouncementData} from '../../../app/features/marketing/announcement-display';

// Mock the UI components
jest.mock('../../../app/components/ui', () => ({
	InfoIcon: () => <svg data-testid='icon-info' />,
	WarningIcon: () => <svg data-testid='icon-warning' />,
	StarIcon: () => <svg data-testid='icon-star' />,
	XIcon: () => <svg data-testid='icon-x' />,
}));

describe('AnnouncementDisplay', () => {
	const baseAnnouncement: AnnouncementData = {
		tekst: 'Test announcement',
		type: 'info',
	};

	it('renders announcement text', () => {
		render(<AnnouncementDisplay announcement={baseAnnouncement} />);

		expect(screen.getByText('Test announcement')).toBeInTheDocument();
	});

	it('has role="alert" for accessibility', () => {
		render(<AnnouncementDisplay announcement={baseAnnouncement} />);

		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	describe('announcement types', () => {
		it('renders info type with correct styling', () => {
			const {container} = render(
				<AnnouncementDisplay announcement={{...baseAnnouncement, type: 'info'}} />,
			);

			const banner = container.querySelector('[role="alert"]');
			expect(banner).toHaveClass('bg-info-600');
		});

		it('renders waarschuwing type with correct styling', () => {
			const {container} = render(
				<AnnouncementDisplay announcement={{...baseAnnouncement, type: 'waarschuwing'}} />,
			);

			const banner = container.querySelector('[role="alert"]');
			expect(banner).toHaveClass('bg-warning-500');
		});

		it('renders belangrijk type with correct styling', () => {
			const {container} = render(
				<AnnouncementDisplay announcement={{...baseAnnouncement, type: 'belangrijk'}} />,
			);

			const banner = container.querySelector('[role="alert"]');
			expect(banner).toHaveClass('bg-primary');
		});

		it('falls back to info styling for unknown type', () => {
			const {container} = render(
				// @ts-expect-error Testing invalid type
				<AnnouncementDisplay announcement={{...baseAnnouncement, type: 'unknown'}} />,
			);

			const banner = container.querySelector('[role="alert"]');
			expect(banner).toHaveClass('bg-info-600');
		});
	});

	describe('link rendering', () => {
		it('renders link when both link and linkTekst are provided', () => {
			const announcement: AnnouncementData = {
				...baseAnnouncement,
				link: '/more-info',
				linkTekst: 'Learn more',
			};

			render(<AnnouncementDisplay announcement={announcement} />);

			const link = screen.getByRole('link', {name: /learn more/i});
			expect(link).toHaveAttribute('href', '/more-info');
		});

		it('does not render link when only link is provided', () => {
			const announcement: AnnouncementData = {
				...baseAnnouncement,
				link: '/more-info',
			};

			render(<AnnouncementDisplay announcement={announcement} />);

			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});

		it('does not render link when only linkTekst is provided', () => {
			const announcement: AnnouncementData = {
				...baseAnnouncement,
				linkTekst: 'Learn more',
			};

			render(<AnnouncementDisplay announcement={announcement} />);

			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});
	});

	describe('dismiss button', () => {
		it('shows dismiss button when onDismiss is provided', () => {
			const onDismiss = jest.fn();

			render(<AnnouncementDisplay announcement={baseAnnouncement} onDismiss={onDismiss} />);

			expect(screen.getByRole('button', {name: /sluiten/i})).toBeInTheDocument();
		});

		it('does not show dismiss button when onDismiss is not provided', () => {
			render(<AnnouncementDisplay announcement={baseAnnouncement} />);

			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});

		it('calls onDismiss when dismiss button is clicked', () => {
			const onDismiss = jest.fn();

			render(<AnnouncementDisplay announcement={baseAnnouncement} onDismiss={onDismiss} />);

			fireEvent.click(screen.getByRole('button', {name: /sluiten/i}));

			expect(onDismiss).toHaveBeenCalledTimes(1);
		});
	});
});
