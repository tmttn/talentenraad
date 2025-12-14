import {render, screen} from '@testing-library/react';
import {CategoryBadge} from '../../../app/components/ui/category-badge';

describe('CategoryBadge', () => {
	it('renders category text', () => {
		render(<CategoryBadge category='Nieuws' />);
		expect(screen.getByText('Nieuws')).toBeInTheDocument();
	});

	describe('category styles', () => {
		it('applies feest styles', () => {
			render(<CategoryBadge category='Feest' />);
			const badge = screen.getByText('Feest');
			expect(badge).toHaveClass('bg-category-event-bg', 'text-category-event-text');
		});

		it('applies kalender styles', () => {
			render(<CategoryBadge category='Kalender' />);
			const badge = screen.getByText('Kalender');
			expect(badge).toHaveClass('bg-category-calendar-bg', 'text-category-calendar-text');
		});

		it('applies activiteit styles', () => {
			render(<CategoryBadge category='Activiteit' />);
			const badge = screen.getByText('Activiteit');
			expect(badge).toHaveClass('bg-category-activity-bg', 'text-category-activity-text');
		});

		it('applies nieuws styles', () => {
			render(<CategoryBadge category='Nieuws' />);
			const badge = screen.getByText('Nieuws');
			expect(badge).toHaveClass('bg-category-news-bg', 'text-category-news-text');
		});

		it('falls back to activiteit styles for unknown category', () => {
			render(<CategoryBadge category='Unknown' />);
			const badge = screen.getByText('Unknown');
			expect(badge).toHaveClass('bg-category-activity-bg', 'text-category-activity-text');
		});

		it('handles case-insensitive category matching', () => {
			render(<CategoryBadge category='FEEST' />);
			const badge = screen.getByText('FEEST');
			expect(badge).toHaveClass('bg-category-event-bg', 'text-category-event-text');
		});
	});

	describe('sizes', () => {
		it('applies sm size by default', () => {
			render(<CategoryBadge category='Test' />);
			const badge = screen.getByText('Test');
			expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
		});

		it('applies xs size', () => {
			render(<CategoryBadge category='Test' size='xs' />);
			const badge = screen.getByText('Test');
			expect(badge).toHaveClass('px-2', 'py-0.5', 'text-[10px]');
		});

		it('applies md size', () => {
			render(<CategoryBadge category='Test' size='md' />);
			const badge = screen.getByText('Test');
			expect(badge).toHaveClass('px-3', 'py-1', 'text-sm');
		});
	});

	it('has rounded-full class', () => {
		render(<CategoryBadge category='Test' />);
		const badge = screen.getByText('Test');
		expect(badge).toHaveClass('rounded-full');
	});

	it('accepts custom className', () => {
		render(<CategoryBadge category='Test' className='custom-class' />);
		const badge = screen.getByText('Test');
		expect(badge).toHaveClass('custom-class');
	});
});
