import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import type {Metadata} from 'next';
import './globals.css';
// eslint-disable-next-line import-x/extensions
import {SiteHeader} from './components/site-header';
// eslint-disable-next-line import-x/extensions
import {SiteFooter} from './components/site-footer';
// eslint-disable-next-line import-x/extensions
import {AnnouncementBanner} from './components/announcement-banner';
// eslint-disable-next-line import-x/extensions
import {FooterCTASection} from './components/builder-section';

export const metadata: Metadata = {
	title: 'Talentenraad',
	description: 'Website van de Talentenhuis Talentenraad',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='nl' className='overflow-auto'>
			<head>
				{/* eslint-disable-next-line n/prefer-global/process */}
				{(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
					<script
						data-project-id='cXhuDUHiYP0QQFVsZtiEudYQMB95amgg0c9tgiNr'
						data-is-production-environment='false'
						src='https://snippet.meticulous.ai/v1/meticulous.js'
					/>
				)}
			</head>
			<body className='min-h-screen flex flex-col antialiased bg-white'>
				<AnnouncementBanner />
				<SiteHeader />
				<main id='main-content' role='main' className='flex-grow' tabIndex={-1}>
					{children}
				</main>
				<FooterCTASection />
				<SiteFooter />
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
