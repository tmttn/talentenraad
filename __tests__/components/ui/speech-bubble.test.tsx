import {render, screen} from '@testing-library/react';
import {SpeechBubble} from '../../../app/components/ui/speech-bubble';

describe('SpeechBubble', () => {
  it('renders children in a contour panel', () => {
    render(<SpeechBubble>Hallo</SpeechBubble>);
    expect(screen.getByText('Hallo')).toHaveClass('contour', 'shadow-hard-lg', 'rounded-panel');
  });

  it('draws a decorative tail by default', () => {
    const {container} = render(<SpeechBubble>Hallo</SpeechBubble>);
    const tail = container.querySelector('svg[aria-hidden="true"]');
    expect(tail).not.toBeNull();
    expect(tail!.querySelectorAll('path')).toHaveLength(2);
  });

  it('can leave the tail out', () => {
    const {container} = render(<SpeechBubble tail='none' className='extra'>Hallo</SpeechBubble>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(container.firstChild).toHaveClass('extra');
  });

  it('can put a flipped tail at the bottom and be green', () => {
    const {container} = render(<SpeechBubble tail='bottom' tone='green' size='md'>Hallo</SpeechBubble>);
    expect(screen.getByText('Hallo')).toHaveClass('bg-logo-green', 'p-7');
    expect(container.querySelector('svg')).toHaveClass('-bottom-[27px]', '-scale-y-100');
    expect(container.querySelector('path')).toHaveAttribute('fill', 'var(--color-logo-green)');
  });
});
