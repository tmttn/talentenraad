import type {ReactNode} from 'react';

type SpeechBubbleProperties = {
  children: ReactNode;
  /** Where the tail points from: the top edge (default) or none. */
  tail?: 'top' | 'none';
  className?: string;
};

/**
 * Contour panel with a tail on its top edge, slanted like the balloon in the logo.
 * The tail is an SVG wedge whose base sits on the inner edge of the panel's border:
 * its white fill hides that stretch of the border, its two strokes continue the contour.
 */
function SpeechBubble({children, tail = 'top', className = ''}: Readonly<SpeechBubbleProperties>) {
  return (
    <div className={`relative ${className}`}>
      <div className='relative rounded-panel bg-white contour shadow-hard-lg p-component-md sm:p-component-lg lg:p-11'>
        {children}
      </div>
      {tail === 'top' && (
        <svg
          aria-hidden='true'
          viewBox='0 0 44 30'
          className='absolute -top-[27px] left-12 w-11 h-[30px] overflow-visible'
        >
          {/* The fill runs 1px into the panel so no antialiased sliver of the border shows at its base */}
          <path d='M0 31 L0 30 L10 1.5 L44 30 L44 31 Z' fill='white' />
          <path d='M0 30 L10 1.5 L44 30' fill='none' stroke='var(--color-ink)' strokeWidth='3' strokeLinejoin='round' />
        </svg>
      )}
    </div>
  );
}

export {SpeechBubble};
export type {SpeechBubbleProperties};
