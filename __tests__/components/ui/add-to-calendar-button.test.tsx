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

  it('takes a label and has a solid contour variant for side panels', () => {
    render(<AddToCalendarButton id='feest' title='Feest' date='2026-12-19' variant='contour-solid' label='In mijn agenda' />);
    expect(screen.getByRole('button', {name: 'In mijn agenda'})).toHaveClass('bg-primary', 'text-white', 'shadow-hard-sm', 'rounded-control');
  });
});
