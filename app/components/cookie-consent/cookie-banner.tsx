'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useCookieConsent, type CookiePreferences} from './cookie-consent-context';

type CookieCategory = {
	key: keyof CookiePreferences;
	label: string;
	description: string;
	required?: boolean;
};

const cookieCategories: CookieCategory[] = [
	{
		key: 'necessary',
		label: 'Noodzakelijk',
		description: 'Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld.',
		required: true,
	},
	{
		key: 'analytics',
		label: 'Analytisch',
		description: 'Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken, zodat we deze kunnen verbeteren.',
	},
	{
		key: 'marketing',
		label: 'Marketing',
		description: 'Deze cookies worden gebruikt om advertenties relevanter te maken voor u en uw interesses.',
	},
];

export function CookieBanner() {
	const {showBanner, acceptAll, rejectAll, savePreferences, preferences} = useCookieConsent();
	const [showDetails, setShowDetails] = useState(false);
	const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

	if (!showBanner) {
		return null;
	}

	const handleToggle = (key: keyof CookiePreferences) => {
		if (key === 'necessary') return; // Can't toggle necessary cookies
		setLocalPreferences(previous => ({
			...previous,
			[key]: !previous[key],
		}));
	};

	const handleSavePreferences = () => {
		savePreferences(localPreferences);
	};

	return (
		<div className='fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center' role='dialog' aria-modal='true' aria-labelledby='cookie-banner-title'>
			{/* Backdrop */}
			<div className='fixed inset-0 bg-black/40 backdrop-blur-sm' aria-hidden='true' />

			{/* Banner */}
			<div className='relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden'>
				{/* Header */}
				<div className='bg-gradient-to-r from-primary to-pink-400 p-6 text-white'>
					<div className='flex items-center gap-3'>
						<div className='p-2 bg-white/20 rounded-full'>
							<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
							</svg>
						</div>
						<div>
							<h2 id='cookie-banner-title' className='text-xl font-bold'>
								Wij gebruiken cookies
							</h2>
							<p className='text-white/80 text-sm mt-1'>
								Om je de beste ervaring te bieden
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className='p-6'>
					{!showDetails ? (
						<>
							<p className='text-gray-600 mb-4'>
								We gebruiken cookies om je ervaring op onze website te verbeteren. Je kunt kiezen welke cookies je accepteert.
								Lees meer in ons{' '}
								<Link href='/cookiebeleid' className='text-primary hover:underline'>
									cookiebeleid
								</Link>{' '}
								en{' '}
								<Link href='/privacybeleid' className='text-primary hover:underline'>
									privacybeleid
								</Link>.
							</p>

							{/* Quick actions */}
							<div className='flex flex-col sm:flex-row gap-3'>
								<button
									type='button'
									onClick={acceptAll}
									className='flex-1 py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
								>
									Alles accepteren
								</button>
								<button
									type='button'
									onClick={rejectAll}
									className='flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
								>
									Alleen noodzakelijk
								</button>
							</div>

							<button
								type='button'
								onClick={() => {
									setShowDetails(true);
								}}
								className='mt-4 w-full py-2 text-primary hover:text-primary-hover font-medium text-sm flex items-center justify-center gap-2'
							>
								<span>Voorkeuren aanpassen</span>
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</button>
						</>
					) : (
						<>
							<div className='space-y-4 mb-6'>
								{cookieCategories.map(category => (
									<div
										key={category.key}
										className={`p-4 rounded-xl border-2 transition-colors ${
											localPreferences[category.key]
												? 'border-primary bg-primary/5'
												: 'border-gray-200'
										}`}
									>
										<div className='flex items-center justify-between'>
											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													<span className='font-semibold text-gray-800'>{category.label}</span>
													{category.required && (
														<span className='text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full'>
															Vereist
														</span>
													)}
												</div>
												<p className='text-sm text-gray-500 mt-1'>{category.description}</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer ml-4'>
												<input
													type='checkbox'
													checked={localPreferences[category.key]}
													onChange={() => {
														handleToggle(category.key);
													}}
													disabled={category.required}
													className='sr-only peer'
												/>
												<div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
													category.required
														? 'bg-gray-400 cursor-not-allowed'
														: 'bg-gray-200 peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30'
												}`} />
											</label>
										</div>
									</div>
								))}
							</div>

							{/* Actions */}
							<div className='flex flex-col sm:flex-row gap-3'>
								<button
									type='button'
									onClick={handleSavePreferences}
									className='flex-1 py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
								>
									Voorkeuren opslaan
								</button>
								<button
									type='button'
									onClick={() => {
										setShowDetails(false);
									}}
									className='flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
								>
									Terug
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
