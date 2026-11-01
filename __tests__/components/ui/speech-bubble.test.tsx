import {render, screen} from '@testing-library/react';
import {SpeechBubble} from '../../../app/components/ui/speech-bubble';

describe('SpeechBubble', () => {
  it('renders children in a contour panel', () => {
    render(<SpeechBubble>Hallo</SpeechBubble>);
    expect(screen.getByText('Hallo')).toHaveClass('contour', 'shadow-hard-lg', 'rounded-panel');
  });

  it('draws a decorative tail by default', () => {
    const {container} = render(<SpeechBubble>Hallo</SpeechBubble>);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('rotate-45');
  });

  it('can leave the tail out', () => {
    const {container} = render(<SpeechBubble tail='none' className='extra'>Hallo</SpeechBubble>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(container.firstChild).toHaveClass('extra');
  });
});
