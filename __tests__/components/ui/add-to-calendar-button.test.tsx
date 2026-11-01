import {fireEvent, render, screen} from '@testing-library/react';
import {downloadICalEvent} from '@lib/calendar';
import {AddToCalendarButton} from '../../../app/components/ui/add-to-calendar-button';

vi.mock('@lib/calendar', () => ({downloadICalEvent: vi.fn()}));

describe('AddToCalendarButton', () => {
  it('downloads an iCal event on click', () => {
    render(<AddToCalendarButton id='feest' title='Feest' date='2026-12-19' />);
    fireEvent.click(screen.getByRole('button', {name: 'Toevoegen aan agenda'}));
    expect(downloadICalEvent).toHaveBeenCalledWith(expect.objectContaining({id: 'feest', title: 'Feest', date: '2026-12-19'}));
  });

  it('renders the contour variant as an outlined pink pill', () => {
    render(<AddToCalendarButton id='feest' title='Feest' date='2026-12-19' variant='contour' />);
    expect(screen.getByRole('button')).toHaveClass('contour-xs', 'bg-brand-primary-100', 'text-black', 'rounded-full');
  });
});
