import type {Metadata} from 'next';
import {getSeasonalDecorationsConfig} from '@components/seasonal-decorations-server';
import {DecoratiesManager} from './decoraties-manager';

export const metadata: Metadata = {
	title: 'Decoraties',
};

export default async function DecoratiesPage() {
	const config = await getSeasonalDecorationsConfig();

	return (
		<div>
			<h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8'>
				Seizoensdecoraties
			</h1>
			<DecoratiesManager initialConfig={config} />
		</div>
	);
}
