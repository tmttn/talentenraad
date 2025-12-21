/**
 * Hypertune Feature Flags Configuration
 *
 * This file defines all feature flags for the application.
 * Once connected to Hypertune, regenerate with: npx hypertune
 */

// Context passed to flag evaluation
export type Context = {
	environment: string;
	user?: {
		id: string;
		email?: string;
		name?: string;
		isAdmin?: boolean;
	};
};

// All flag values
export type FlagValues = {
	// Admin Features
	adminSubmissions: boolean;
	adminActivities: boolean;
	adminNews: boolean;
	adminAnnouncements: boolean;
	adminNotifications: boolean;
	adminDecorations: boolean;
	adminUsers: boolean;
	adminAuditLogs: boolean;

	// User Features
	pushNotifications: boolean;
	contactForm: boolean;
	contactFormPhone: boolean;
	contactFormSubject: boolean;
	recaptcha: boolean;
	newsletterSignup: boolean;

	// Marketing Features
	announcementBanner: boolean;
	heroBanner: boolean;
	ctaBanner: boolean;

	// Content Features
	activitiesList: boolean;
	activitiesCalendar: boolean;
	activitiesArchive: boolean;
	newsList: boolean;
	faqSection: boolean;
	teamGrid: boolean;
	photoGallery: boolean;
	photoGalleryLightbox: boolean;
	photoGalleryZoom: boolean;
	photoGalleryDownload: boolean;

	// PWA Features
	serviceWorker: boolean;
	offlinePage: boolean;

	// Seasonal Features
	seasonalDecorations: boolean;

	// Other Features
	cookieBanner: boolean;
};

// Fallback values when Hypertune is not connected
export const flagFallbacks: FlagValues = {
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

	// Seasonal Features
	seasonalDecorations: false, // Off by default, enable during holidays

	// Other Features
	cookieBanner: true,
};

// Flag definition type
type FlagDefinition = {
	key: string;
	description: string;
	defaultValue: boolean;
	options: Array<{value: boolean; label: string}>;
};

// Flag definitions for Vercel Flags Explorer
export const vercelFlagDefinitions: Record<keyof FlagValues, FlagDefinition> = {
	// Admin Features
	adminSubmissions: {
		key: 'admin-submissions',
		description: 'Enable admin submissions management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminActivities: {
		key: 'admin-activities',
		description: 'Enable admin activities/events management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminNews: {
		key: 'admin-news',
		description: 'Enable admin news management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminAnnouncements: {
		key: 'admin-announcements',
		description: 'Enable admin announcements management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminNotifications: {
		key: 'admin-notifications',
		description: 'Enable admin push notifications management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminDecorations: {
		key: 'admin-decorations',
		description: 'Enable admin seasonal decorations settings',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminUsers: {
		key: 'admin-users',
		description: 'Enable admin user management',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	adminAuditLogs: {
		key: 'admin-audit-logs',
		description: 'Enable admin audit logs viewer',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},

	// User Features
	pushNotifications: {
		key: 'push-notifications',
		description: 'Enable push notification subscriptions for users',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	contactForm: {
		key: 'contact-form',
		description: 'Enable the contact form',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	contactFormPhone: {
		key: 'contact-form-phone',
		description: 'Show phone field in contact form',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	contactFormSubject: {
		key: 'contact-form-subject',
		description: 'Show subject dropdown in contact form',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	recaptcha: {
		key: 'recaptcha',
		description: 'Enable reCAPTCHA on forms',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	newsletterSignup: {
		key: 'newsletter-signup',
		description: 'Enable newsletter signup form',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},

	// Marketing Features
	announcementBanner: {
		key: 'announcement-banner',
		description: 'Show announcement banner on site',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	heroBanner: {
		key: 'hero-banner',
		description: 'Show hero section on homepage',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	ctaBanner: {
		key: 'cta-banner',
		description: 'Show call-to-action banners',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},

	// Content Features
	activitiesList: {
		key: 'activities-list',
		description: 'Show activities list on site',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	activitiesCalendar: {
		key: 'activities-calendar',
		description: 'Show activities calendar view',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	activitiesArchive: {
		key: 'activities-archive',
		description: 'Show past activities archive',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	newsList: {
		key: 'news-list',
		description: 'Show news articles list',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	faqSection: {
		key: 'faq-section',
		description: 'Show FAQ section',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	teamGrid: {
		key: 'team-grid',
		description: 'Show team members grid',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
	photoGallery: {
		key: 'photo-gallery',
		description: 'Enable photo gallery component',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	photoGalleryLightbox: {
		key: 'photo-gallery-lightbox',
		description: 'Enable lightbox in photo gallery',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	photoGalleryZoom: {
		key: 'photo-gallery-zoom',
		description: 'Enable zoom in photo gallery lightbox',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	photoGalleryDownload: {
		key: 'photo-gallery-download',
		description: 'Enable download button in photo gallery',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},

	// PWA Features
	serviceWorker: {
		key: 'service-worker',
		description: 'Enable service worker for offline support',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},
	offlinePage: {
		key: 'offline-page',
		description: 'Show offline fallback page',
		defaultValue: true,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},

	// Seasonal Features
	seasonalDecorations: {
		key: 'seasonal-decorations',
		description: 'Enable seasonal decorations (snowfall, lights)',
		defaultValue: false,
		options: [{value: true, label: 'Enabled'}, {value: false, label: 'Disabled'}],
	},

	// Other Features
	cookieBanner: {
		key: 'cookie-banner',
		description: 'Show GDPR cookie consent banner',
		defaultValue: true,
		options: [{value: true, label: 'Show'}, {value: false, label: 'Hide'}],
	},
};

/**
 * Create Hypertune source for the SDK
 * Returns fallback-based source when no token is configured
 */
export function createSource() {
	// Return a source that uses fallback values
	// Once connected to Hypertune, this will be replaced by the generated code
	return {
		async initIfNeeded() {
			// No-op for fallback source
		},
		getFlag<K extends keyof FlagValues>(key: K): FlagValues[K] {
			return flagFallbacks[key];
		},
	};
}

// Export types for the adapter
export type {FlagValues as Flags};
