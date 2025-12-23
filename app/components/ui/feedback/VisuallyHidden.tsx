import type {ReactNode} from 'react';

type VisuallyHiddenProps = {
  /** Content to be visually hidden but accessible to screen readers */
  children: ReactNode;
  /** Render as a specific element */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

/**
 * VisuallyHidden - Hide content visually while keeping it accessible to screen readers
 *
 * Usage:
 * <button>
 *   <Icon name="menu" />
 *   <VisuallyHidden>Open menu</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden({children, as: Component = 'span'}: VisuallyHiddenProps) {
  return (
    <Component
      className='absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0'
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
        margin: '-1px',
      }}
    >
      {children}
    </Component>
  );
}
