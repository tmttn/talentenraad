'use client';

import {useState, type ChangeEvent} from 'react';
import {toast} from 'sonner';
import {Info} from 'lucide-react';
import type {SeasonalDecorationsConfig} from '@/lib/db';

type DecoratiesManagerProps = {
	initialConfig: SeasonalDecorationsConfig;
};

const decorationLabels: Record<keyof SeasonalDecorationsConfig['decorations'], {label: string; description: string}> = {
	christmasLights: {
		label: 'Kerstlichtjes',
		description: 'Kleurrijke lichtjes bovenaan de pagina',
	},
	snowfall: {
		label: 'Sneeuwvlokken',
		description: 'Vallende sneeuwvlokken over de hele pagina',
	},
	icicles: {
		label: 'IJspegels',
		description: 'IJspegels die aan de bovenkant hangen',
	},
	gingerbreadMan: {
		label: 'Peperkoekmannetjes',
		description: 'Leuke peperkoekmannetjes aan de zijkanten',
	},
	christmasBalls: {
		label: 'Kerstballen',
		description: 'Hangende kerstballen aan de zijkanten',
	},
};

export function DecoratiesManager({initialConfig}: DecoratiesManagerProps) {
	const [config, setConfig] = useState<SeasonalDecorationsConfig>(initialConfig);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleToggleEnabled = (event: ChangeEvent<HTMLInputElement>) => {
		setConfig(prev => ({...prev, enabled: event.target.checked}));
	};

	const handleToggleDecoration = (key: keyof SeasonalDecorationsConfig['decorations']) => {
		setConfig(prev => ({
			...prev,
			decorations: {
				...prev.decorations,
				[key]: !prev.decorations[key],
			},
		}));
	};

	const handleSelectAll = () => {
		setConfig(prev => ({
			...prev,
			decorations: {
				christmasLights: true,
				snowfall: true,
				icicles: true,
				gingerbreadMan: true,
				christmasBalls: true,
			},
		}));
	};

	const handleDeselectAll = () => {
		setConfig(prev => ({
			...prev,
			decorations: {
				christmasLights: false,
				snowfall: false,
				icicles: false,
				gingerbreadMan: false,
				christmasBalls: false,
			},
		}));
	};

	const handleSave = async () => {
		setIsSubmitting(true);

		try {
			const response = await fetch('/api/admin/settings/seasonal-decorations', {
				method: 'PUT',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(config),
			});

			if (!response.ok) {
				throw new Error('Opslaan mislukt');
			}

			toast.success('Instellingen opgeslagen!');
		} catch {
			toast.error('Er is een fout opgetreden bij het opslaan');
		} finally {
			setIsSubmitting(false);
		}
	};

	const allSelected = Object.values(config.decorations).every(Boolean);
	const noneSelected = Object.values(config.decorations).every(v => !v);

	return (
		<div className='space-y-6'>
			{/* Main toggle card */}
			<div className='bg-white rounded-card shadow-base p-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h2 className='text-xl font-bold text-gray-800'>Kerstdecoraties</h2>
						<p className='text-gray-600 mt-1'>
							Activeer feestelijke decoraties op de website
						</p>
					</div>
					<label className='relative inline-flex items-center cursor-pointer'>
						<input
							type='checkbox'
							checked={config.enabled}
							onChange={handleToggleEnabled}
							className='sr-only peer'
						/>
						<div className='w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary'></div>
						<span className='ms-3 text-sm font-medium text-gray-700'>
							{config.enabled ? 'Actief' : 'Inactief'}
						</span>
					</label>
				</div>
			</div>

			{/* Decorations selection */}
			<div className={`bg-white rounded-card shadow-base p-6 ${!config.enabled && 'opacity-60'}`}>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg font-bold text-gray-800'>Beschikbare decoraties</h3>
					<div className='flex gap-2'>
						<button
							type='button'
							onClick={handleSelectAll}
							disabled={!config.enabled || allSelected}
							className='text-sm text-primary hover:text-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Alles aan
						</button>
						<span className='text-gray-300'>|</span>
						<button
							type='button'
							onClick={handleDeselectAll}
							disabled={!config.enabled || noneSelected}
							className='text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Alles uit
						</button>
					</div>
				</div>

				<div className='grid gap-4 sm:grid-cols-2'>
					{(Object.keys(decorationLabels) as Array<keyof typeof decorationLabels>).map(key => (
						<label
							key={key}
							className={`flex items-start gap-4 p-4 rounded-button border-2 cursor-pointer transition-colors ${
								config.decorations[key]
									? 'border-primary bg-primary/5'
									: 'border-gray-200 hover:border-gray-300'
							} ${!config.enabled && 'cursor-not-allowed'}`}
						>
							<input
								type='checkbox'
								checked={config.decorations[key]}
								onChange={() => {
									handleToggleDecoration(key);
								}}
								disabled={!config.enabled}
								className='mt-1 w-5 h-5 accent-pink-500 border-gray-300 rounded focus:ring-pink-500 disabled:cursor-not-allowed'
							/>
							<div>
								<span className='block font-medium text-gray-800'>
									{decorationLabels[key].label}
								</span>
								<span className='text-sm text-gray-500'>
									{decorationLabels[key].description}
								</span>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Preview info */}
			<div className='bg-blue-50 border border-blue-200 rounded-card p-4'>
				<div className='flex gap-3'>
					<Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
					<div>
						<p className='text-blue-800 font-medium'>Let op</p>
						<p className='text-blue-700 text-sm'>
							De decoraties worden direct zichtbaar op de website na het opslaan.
							Bezoekers met &apos;verminderde beweging&apos; voorkeur zien geen animaties.
						</p>
					</div>
				</div>
			</div>

			{/* Save button */}
			<div className='flex justify-end'>
				<button
					type='button'
					onClick={handleSave}
					disabled={isSubmitting}
					className='px-6 py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors disabled:opacity-50'
				>
					{isSubmitting ? 'Bezig met opslaan...' : 'Instellingen opslaan'}
				</button>
			</div>
		</div>
	);
}
