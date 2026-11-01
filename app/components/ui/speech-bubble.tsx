import type {ReactNode} from 'react';

type SpeechBubbleProperties = {
  children: ReactNode;
  /** Where the tail points from: the top edge (default) or none. */
  tail?: 'top' | 'none';
  className?: string;
};

/**
 * Contour panel with a small tail, like a speech balloon.
 * The tail is a rotated square with two contour sides, drawn over the panel's top edge.
 */
function SpeechBubble({children, tail = 'top', className = ''}: Readonly<SpeechBubbleProperties>) {
  return (
    <div className={`relative ${className}`}>
      <div className='relative rounded-panel bg-white contour shadow-hard-lg p-component-md sm:p-component-lg lg:p-11'>
        {children}
      </div>
      {tail === 'top' && (
        <div
          aria-hidden='true'
          className='absolute -top-[15px] left-14 size-[26px] rotate-45 bg-white border-l-(length:--contour-width) border-t-(length:--contour-width) border-ink'
        />
      )}
    </div>
  );
}

export {SpeechBubble};
export type {SpeechBubbleProperties};
