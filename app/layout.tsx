import {env} from 'node:process';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import type {Metadata} from 'next';
import Head from 'next/head';
import './globals.css';

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
			<Head>
				{(env.NODE_ENV === 'development' || env.VERCEL_ENV === 'preview') && (
					<script
						data-project-id='cXhuDUHiYP0QQFVsZtiEudYQMB95amgg0c9tgiNr'
						data-is-production-environment='false'
						src='https://snippet.meticulous.ai/v1/meticulous.js'
					/>
				)}
			</Head>
			<body className='w-screen overflow-hidden antialiased bg-gradient-to-b from-white to-base-100'>
				{children}
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
