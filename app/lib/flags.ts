/**
 * Feature Flags Configuration
 *
 * This file exports all feature flags for the application.
 * Flags are managed via Hypertune and cached in Vercel Edge Config.
 *
 * Usage in Server Components:
 *   import { getFlag } from '@lib/flags';
 *   const isEnabled = await getFlag('pushNotifications');
 *
 * Usage in Client Components:
 *   Use the useFlag hook from '@lib/flags-client'
 */

import 'server-only';
import type {FlagValues} from '@generated/hypertune/hypertune';
import {flagFallbacks} from './flag-defaults';

// Re-export types and fallbacks
export type {FlagValues} from '@generated/hypertune/hypertune';
export {flagFallbacks} from './flag-defaults';

/**
 * Get a feature flag value
 * Uses fallback values until Hypertune is fully connected
 */
export async function getFlag<K extends keyof FlagValues>(key: K): Promise<FlagValues[K]> {
  // TODO: Once Hypertune is connected, replace with actual SDK call
  // For now, use fallback values
  return flagFallbacks[key];
}

/**
 * Get all flag values at once (useful for client-side hydration)
 */
export async function getAllFlags(): Promise<FlagValues> {
  // TODO: Once Hypertune is connected, fetch all flags from SDK
  return {...flagFallbacks};
}

// =============================================================================
// CONVENIENCE FLAG GETTERS
// These provide type-safe access to individual flags
// =============================================================================

// Admin Features
export const adminSubmissions = () => getFlag('adminSubmissions');
export const adminActivities = () => getFlag('adminActivities');
export const adminNews = () => getFlag('adminNews');
export const adminAnnouncements = () => getFlag('adminAnnouncements');
export const adminNotifications = () => getFlag('adminNotifications');
export const adminDecorations = () => getFlag('adminDecorations');
export const adminUsers = () => getFlag('adminUsers');
export const adminAuditLogs = () => getFlag('adminAuditLogs');

// User Features
export const pushNotifications = () => getFlag('pushNotifications');
export const contactForm = () => getFlag('contactForm');
export const contactFormPhone = () => getFlag('contactFormPhone');
export const contactFormSubject = () => getFlag('contactFormSubject');
export const recaptcha = () => getFlag('recaptcha');
export const newsletterSignup = () => getFlag('newsletterSignup');

// Marketing Features
export const announcementBanner = () => getFlag('announcementBanner');
export const heroBanner = () => getFlag('heroBanner');
export const ctaBanner = () => getFlag('ctaBanner');

// Content Features
export const activitiesList = () => getFlag('activitiesList');
export const activitiesCalendar = () => getFlag('activitiesCalendar');
export const activitiesArchive = () => getFlag('activitiesArchive');
export const newsList = () => getFlag('newsList');
export const faqSection = () => getFlag('faqSection');
export const teamGrid = () => getFlag('teamGrid');
export const photoGallery = () => getFlag('photoGallery');
export const photoGalleryLightbox = () => getFlag('photoGalleryLightbox');
export const photoGalleryZoom = () => getFlag('photoGalleryZoom');
export const photoGalleryDownload = () => getFlag('photoGalleryDownload');

// PWA Features
export const serviceWorker = () => getFlag('serviceWorker');
export const offlinePage = () => getFlag('offlinePage');

// Seasonal Features
export const seasonalDecorations = () => getFlag('seasonalDecorations');

// Other Features
export const cookieBanner = () => getFlag('cookieBanner');

// Engagement Features
export const feedbackButton = () => getFlag('feedbackButton');
export const clapsButton = () => getFlag('clapsButton');
