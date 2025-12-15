import {render, screen, fireEvent} from '@testing-library/react';
import {AnnouncementsContainer} from '../../../app/features/marketing/announcements-container';
import type {AnnouncementData} from '../../../app/features/marketing/announcement-display';

describe('AnnouncementsContainer', () => {
	const globalAnnouncement: AnnouncementData = {
		tekst: 'Global announcement',
		type: 'info',
	};

	const pageAnnouncement: AnnouncementData = {
		tekst: 'Page announcement',
		type: 'waarschuwing',
	};

	it('renders nothing when no announcements are provided', () => {
		const {container} = render(<AnnouncementsContainer />);

		expect(container.firstChild).toBeNull();
	});

	it('renders nothing when announcements are undefined', () => {
		const {container} = render(
			<AnnouncementsContainer
				globalAnnouncement={undefined}
				pageAnnouncement={undefined}
			/>,
		);

		expect(container.firstChild).toBeNull();
	});

	it('renders only global announcement when page announcement is not provided', () => {
		render(<AnnouncementsContainer globalAnnouncement={globalAnnouncement} />);

		expect(screen.getByText('Global announcement')).toBeInTheDocument();
		expect(screen.queryByText('Page announcement')).not.toBeInTheDocument();
	});

	it('renders only page announcement when global announcement is not provided', () => {
		render(<AnnouncementsContainer pageAnnouncement={pageAnnouncement} />);

		expect(screen.getByText('Page announcement')).toBeInTheDocument();
		expect(screen.queryByText('Global announcement')).not.toBeInTheDocument();
	});

	it('renders both announcements when both are provided', () => {
		render(
			<AnnouncementsContainer
				globalAnnouncement={globalAnnouncement}
				pageAnnouncement={pageAnnouncement}
			/>,
		);

		expect(screen.getByText('Global announcement')).toBeInTheDocument();
		expect(screen.getByText('Page announcement')).toBeInTheDocument();
	});

	it('renders page announcement before global announcement', () => {
		const {container} = render(
			<AnnouncementsContainer
				globalAnnouncement={globalAnnouncement}
				pageAnnouncement={pageAnnouncement}
			/>,
		);

		const alerts = container.querySelectorAll('[role="alert"]');
		expect(alerts).toHaveLength(2);

		// Page announcement should be first (warning style)
		expect(alerts[0]).toHaveClass('bg-warning-500');
		// Global announcement should be second (info style)
		expect(alerts[1]).toHaveClass('bg-info-600');
	});

	describe('dismissing announcements', () => {
		it('can dismiss page announcement independently', () => {
			render(
				<AnnouncementsContainer
					globalAnnouncement={globalAnnouncement}
					pageAnnouncement={pageAnnouncement}
				/>,
			);

			// Both are visible
			expect(screen.getByText('Page announcement')).toBeInTheDocument();
			expect(screen.getByText('Global announcement')).toBeInTheDocument();

			// Find and click the first close button (page announcement)
			const closeButtons = screen.getAllByRole('button', {name: /sluiten/i});
			fireEvent.click(closeButtons[0]);

			// Page announcement should be gone, global should remain
			expect(screen.queryByText('Page announcement')).not.toBeInTheDocument();
			expect(screen.getByText('Global announcement')).toBeInTheDocument();
		});

		it('can dismiss global announcement independently', () => {
			render(
				<AnnouncementsContainer
					globalAnnouncement={globalAnnouncement}
					pageAnnouncement={pageAnnouncement}
				/>,
			);

			// Both are visible
			expect(screen.getByText('Page announcement')).toBeInTheDocument();
			expect(screen.getByText('Global announcement')).toBeInTheDocument();

			// Find and click the second close button (global announcement)
			const closeButtons = screen.getAllByRole('button', {name: /sluiten/i});
			fireEvent.click(closeButtons[1]);

			// Global announcement should be gone, page should remain
			expect(screen.getByText('Page announcement')).toBeInTheDocument();
			expect(screen.queryByText('Global announcement')).not.toBeInTheDocument();
		});

		it('renders nothing when both announcements are dismissed', () => {
			const {container} = render(
				<AnnouncementsContainer
					globalAnnouncement={globalAnnouncement}
					pageAnnouncement={pageAnnouncement}
				/>,
			);

			// Dismiss page announcement first
			const pageCloseButton = screen.getAllByRole('button', {name: /sluiten/i})[0];
			fireEvent.click(pageCloseButton);

			// Now dismiss global announcement (which is now the only one left)
			const globalCloseButton = screen.getByRole('button', {name: /sluiten/i});
			fireEvent.click(globalCloseButton);

			// Container should now be empty (null)
			expect(container.firstChild).toBeNull();
		});
	});
});
