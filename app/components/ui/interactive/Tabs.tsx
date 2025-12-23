'use client';

import type {ReactNode} from 'react';
import {useState} from 'react';

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsVariant = 'underline' | 'pills' | 'bordered';

type TabsProps = {
  /** Tab definitions */
  tabs: Tab[];
  /** Initially active tab ID */
  defaultTab?: string;
  /** Controlled active tab */
  activeTab?: string;
  /** Callback when tab changes */
  onChange?: (tabId: string) => void;
  /** Visual variant */
  variant?: TabsVariant;
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Tab variant styles using design tokens
 * - Transition: duration-fast
 * - Border radius: rounded-button (pills), rounded-input (bordered)
 * - Gap: gap-gap-xs
 * - Padding: component tokens
 */
const variantClasses: Record<TabsVariant, {list: string; tab: string; active: string}> = {
  underline: {
    list: 'border-b border-gray-200',
    tab: 'px-component-sm py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px transition-colors duration-fast',
    active: 'border-primary text-primary',
  },
  pills: {
    list: 'gap-gap-xs',
    tab: 'px-component-sm py-2 text-sm font-medium text-gray-600 rounded-button hover:bg-gray-100 transition-colors duration-fast',
    active: 'bg-primary text-white hover:bg-primary',
  },
  bordered: {
    list: 'border border-gray-200 rounded-button p-1 bg-gray-50',
    tab: 'px-component-sm py-2 text-sm font-medium text-gray-600 rounded-input transition-colors duration-fast',
    active: 'bg-white text-gray-900 shadow-subtle',
  },
};

/**
 * Tabs - Tab navigation component
 *
 * Uses design tokens:
 * - Transition: duration-fast
 * - Border radius: rounded-button, rounded-input
 * - Gap: gap-gap-xs
 * - Shadow: shadow-subtle (bordered active)
 * - Padding: px-component-sm, pt-component-sm
 *
 * Usage:
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'First', content: <div>Content 1</div> },
 *     { id: 'tab2', label: 'Second', content: <div>Content 2</div> },
 *   ]}
 * />
 */
export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const styles = variantClasses[variant];

  const handleTabChange = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }

    onChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role='tablist'
        className={[
          'flex',
          fullWidth && 'w-full',
          styles.list,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role='tab'
            type='button'
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
            className={[
              styles.tab,
              fullWidth && 'flex-1 text-center',
              activeTab === tab.id && styles.active,
              tab.disabled && 'opacity-50 cursor-not-allowed',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panel - uses pt-component-sm token for consistent spacing */}
      <div
        role='tabpanel'
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className='pt-component-sm'
      >
        {activeTabContent}
      </div>
    </div>
  );
}
