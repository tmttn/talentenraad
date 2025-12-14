import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Talentenraad',
	description: 'Website van de Talentenhuis Talentenraad',
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
				{children}
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
