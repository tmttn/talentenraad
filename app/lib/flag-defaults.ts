/**
 * Feature Flag Default Values
 *
 * This file contains the default/fallback values for all feature flags.
 * Can be imported by both server and client components.
 */

import type {FlagValues} from '@/generated/hypertune/hypertune';
import {flagFallbacks as generatedFallbacks} from '@/generated/hypertune/hypertune';

// Override fallbacks - most features should be ON by default
export const flagFallbacks: FlagValues = {
	...generatedFallbacks,
	// Admin Features - all enabled by default
	adminSubmissions: true,
	adminActivities: true,
	adminNews: true,
	adminAnnouncements: true,
	adminNotifications: true,
	adminDecorations: true,
	adminUsers: true,
	adminAuditLogs: true,

	// User Features
	pushNotifications: true,
	contactForm: true,
	contactFormPhone: true,
	contactFormSubject: true,
	recaptcha: true,
	newsletterSignup: true,

	// Marketing Features
	announcementBanner: true,
	heroBanner: true,
	ctaBanner: true,

	// Content Features
	activitiesList: true,
	activitiesCalendar: true,
	activitiesArchive: true,
	newsList: true,
	faqSection: true,
	teamGrid: true,
	photoGallery: true,
	photoGalleryLightbox: true,
	photoGalleryZoom: true,
	photoGalleryDownload: true,

	// PWA Features
	serviceWorker: true,
	offlinePage: true,

	// Seasonal Features - off by default
	seasonalDecorations: false,

	// Other Features
	cookieBanner: true,
};
