import type {ReactNode} from 'react';

/**
 * Admin Layout (Root Level)
 *
 * Minimal layout for admin routes outside the protected area (e.g., login).
 * This layout is required for the admin-level not-found.tsx and error.tsx
 * to properly catch errors and 404s in this route segment.
 */
export default function AdminLayout({children}: Readonly<{children: ReactNode}>) {
	return children;
}
