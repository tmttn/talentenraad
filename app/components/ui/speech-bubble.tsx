import type {ReactNode} from 'react';

type SpeechBubbleProperties = {
  children: ReactNode;
  /** Edge the tail sits on: the top (default), the bottom, or none. */
  tail?: 'top' | 'bottom' | 'none';
  /** Fill: white (default) or logo green, with black text. */
  tone?: 'white' | 'green';
  /** `lg` for a hero, `md` for a side panel or a card-sized balloon. */
  size?: 'md' | 'lg';
  className?: string;
};

const toneStyles = {
  white: {panel: 'bg-white', fill: 'white'},
  green: {panel: 'bg-logo-green text-black', fill: 'var(--color-logo-green)'},
};

const sizeStyles = {
  md: 'p-7',
  lg: 'p-component-md sm:p-component-lg lg:p-11',
};

/**
 * Contour panel with a tail, slanted like the balloon in the logo.
 * The tail is an SVG wedge whose base sits on the inner edge of the panel's border:
 * its fill hides that stretch of the border, its two strokes continue the contour.
 * A bottom tail is the same wedge, flipped.
 */
function SpeechBubble({
  children, tail = 'top', tone = 'white', size = 'lg', className = '',
}: Readonly<SpeechBubbleProperties>) {
  const colors = toneStyles[tone];

  return (
    <div className={`relative ${className}`}>
      <div className={`relative rounded-panel contour shadow-hard-lg ${colors.panel} ${sizeStyles[size]}`}>
        {children}
      </div>
      {tail !== 'none' && (
        <svg
          aria-hidden='true'
          viewBox='0 0 44 30'
          className={`absolute left-12 w-11 h-[30px] overflow-visible ${tail === 'top' ? '-top-[27px]' : '-bottom-[27px] -scale-y-100'}`}
        >
          {/* The fill runs 1px into the panel so no antialiased sliver of the border shows at its base */}
          <path d='M0 31 L0 30 L10 1.5 L44 30 L44 31 Z' fill={colors.fill} />
          <path d='M0 30 L10 1.5 L44 30' fill='none' stroke='var(--color-ink)' strokeWidth='3' strokeLinejoin='round' />
        </svg>
      )}
    </div>
  );
}

export {SpeechBubble};
export type {SpeechBubbleProperties};
