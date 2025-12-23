import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import type {Metadata, Viewport} from 'next';
import {siteConfig, generateOrganizationSchema, JsonLd} from '@lib/seo';
import {SwRegister} from '@components/pwa/sw-register';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.defaultImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Root Layout
 *
 * Minimal root layout that provides the HTML structure.
 * Route groups add their own nested layouts for specific sections.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang='nl' className='overflow-auto'>
      <head>
        <JsonLd data={organizationSchema} />
        {(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
          <script
            data-project-id='cXhuDUHiYP0QQFVsZtiEudYQMB95amgg0c9tgiNr'
            data-is-production-environment='false'
            src='https://snippet.meticulous.ai/v1/meticulous.js'
          />
        )}
      </head>
      <body className='min-h-screen flex flex-col antialiased bg-white'>
        {children}
        <SwRegister />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
