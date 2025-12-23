'use client';

import type {ReactNode} from 'react';
import {useState} from 'react';

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
};

type AccordionProps = {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be open */
  allowMultiple?: boolean;
  /** Initially open item IDs */
  defaultOpen?: string[];
  /** Additional CSS classes */
  className?: string;
};

/**
 * Accordion - Expandable sections component
 *
 * Uses design tokens:
 * - Transition: duration-fast (button), duration-base (icon, content)
 * - Padding: py-component-sm, pb-component-sm
 *
 * Usage:
 * <Accordion
 *   items={[
 *     { id: 'faq1', title: 'Question 1?', content: <p>Answer 1</p> },
 *     { id: 'faq2', title: 'Question 2?', content: <p>Answer 2</p> },
 *   ]}
 * />
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (!allowMultiple) {
          next.clear();
        }

        next.add(itemId);
      }

      return next;
    });
  };

  return (
    <div className={`divide-y divide-gray-200 border-y border-gray-200 ${className}`}>
      {items.map(item => {
        const isOpen = openItems.has(item.id);

        return (
          <div key={item.id}>
            {/* Accordion button - uses py-component-sm, duration-fast tokens */}
            <button
              type='button'
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              className={[
                'flex w-full items-center justify-between py-component-sm text-left',
                'text-gray-900 font-medium',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                'transition-colors duration-fast',
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-primary cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span>{item.title}</span>
              {/* Chevron icon - uses duration-base for smooth rotation */}
              <svg
                className={[
                  'h-5 w-5 text-gray-400 transition-transform duration-base',
                  isOpen && 'rotate-180',
                ]
                  .filter(Boolean)
                  .join(' ')}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </button>

            {/* Accordion content - uses duration-base, pb-component-sm tokens */}
            <div
              id={`accordion-content-${item.id}`}
              role='region'
              aria-labelledby={`accordion-header-${item.id}`}
              className={[
                'overflow-hidden transition-all duration-base',
                isOpen ? 'max-h-96 pb-component-sm' : 'max-h-0',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className='text-gray-600'>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
