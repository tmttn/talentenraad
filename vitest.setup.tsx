/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';

// Suppress specific React console errors for known test limitations
const originalConsoleError = console.error;
console.error = (...arguments_) => {
  const message = String(arguments_[0]);
  // Suppress html-in-div warnings (layout tests) and fill attribute warnings (next/image mock)
  if (message.includes('cannot be a child of')
    || message.includes('non-boolean attribute')) {
    return;
  }

  originalConsoleError(...arguments_);
};

// Mock next/image
vi.mock('next/image', () => ({
  default: ({priority, fill, ...properties}: React.ImgHTMLAttributes<HTMLImageElement> & {priority?: boolean; fill?: boolean}) =>
  // eslint-disable-next-line @next/next/no-img-element
    <img {...properties} data-priority={priority ? 'true' : undefined} data-fill={fill ? 'true' : undefined} alt={properties.alt ?? ''} />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({children, href, ...properties}: {children: React.ReactNode; href: string}) => (
    <a href={href} {...properties}>{children}</a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

