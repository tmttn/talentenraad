import {render, screen} from '@testing-library/react';
import {DateBadge, formatDateParts} from '../../../app/components/ui/date-badge';

describe('formatDateParts', () => {
  it('formats a Date object correctly', () => {
    const date = new Date('2025-03-15');
    const {day, month} = formatDateParts(date);
    expect(day).toBe(15);
    expect(month).toBe('MRT');
  });

  it('formats a date string correctly', () => {
    const {day, month} = formatDateParts('2025-12-25');
    expect(day).toBe(25);
    expect(month).toBe('DEC');
  });

  it('handles different months', () => {
    const months = [
      {date: '2025-01-01', expected: 'JAN'},
      {date: '2025-02-01', expected: 'FEB'},
      {date: '2025-06-01', expected: 'JUN'},
      {date: '2025-09-01', expected: 'SEP'},
    ];

    for (const {date, expected} of months) {
      const {month} = formatDateParts(date);
      expect(month).toBe(expected);
    }
  });
});

describe('DateBadge', () => {
  it('renders day and month from date string', () => {
    render(<DateBadge date='2025-03-15' />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('MRT')).toBeInTheDocument();
  });

  it('renders day and month from Date object', () => {
    const date = new Date('2025-12-25');
    render(<DateBadge date={date} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('DEC')).toBeInTheDocument();
  });

  describe('sizes', () => {
    it('applies md size by default', () => {
      const {container} = render(<DateBadge date='2025-03-15' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('w-16', 'h-16', 'rounded-card');
    });

    it('applies sm size', () => {
      const {container} = render(<DateBadge date='2025-03-15' size='sm' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('w-12', 'h-12', 'rounded-button');
    });

    it('applies lg size', () => {
      const {container} = render(<DateBadge date='2025-03-15' size='lg' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('w-20', 'h-20', 'rounded-modal');
    });
  });

  describe('variants', () => {
    it('applies primary variant by default', () => {
      const {container} = render(<DateBadge date='2025-03-15' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-primary', 'text-white');
    });

    it('applies secondary variant', () => {
      const {container} = render(<DateBadge date='2025-03-15' variant='secondary' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-secondary', 'text-white');
    });

    it('applies white variant', () => {
      const {container} = render(<DateBadge date='2025-03-15' variant='white' />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-white', 'text-primary');
    });
  });

  it('accepts custom className', () => {
    const {container} = render(<DateBadge date='2025-03-15' className='custom-class' />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-class');
  });
});
