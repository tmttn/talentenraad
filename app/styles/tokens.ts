/**
 * Design Tokens - Backwards Compatibility Re-export
 *
 * @deprecated Import from '@/app/styles/tokens' instead.
 * This file re-exports from the new token system for backwards compatibility.
 *
 * New usage:
 * import { brandColors, spacing, shadows } from '@/app/styles/tokens'
 */

// Re-export everything from the new token system
// Note: Using extensionless import for Jest compatibility
// eslint-disable-next-line import-x/extensions
export * from './tokens/index';
