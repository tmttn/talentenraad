import {render, screen} from '@testing-library/react';
import {ConditionalFeedbackButton} from '@components/feedback/conditional-feedback-button';

vi.mock('@components/feedback/floating-feedback-button', () => ({
  FloatingFeedbackButton: () => <button type='button'>Feedback</button>,
}));

describe('ConditionalFeedbackButton', () => {
  it('renders the feedback button', () => {
    render(<ConditionalFeedbackButton />);
    expect(screen.getByRole('button', {name: 'Feedback'})).toBeInTheDocument();
  });
});
