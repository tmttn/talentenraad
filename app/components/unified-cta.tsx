'use client';

type CTAAction = {
	text: string;
	link: string;
	variant: 'primary' | 'secondary';
};

type UnifiedCTAProperties = {
	title?: string;
	subtitle?: string;
	primaryButtonText?: string;
	primaryButtonLink?: string;
	secondaryButtonText?: string;
	secondaryButtonLink?: string;
	showVolunteerCTA?: boolean;
	showContactCTA?: boolean;
	showNewsletterCTA?: boolean;
	variant?: 'compact' | 'full' | 'minimal';
};

function UnifiedCTA({
	title = 'Doe mee met de Talentenraad',
	subtitle = 'Heb je vragen, ideeën, of wil je meehelpen? We horen graag van je!',
	primaryButtonText = 'Neem contact op',
	primaryButtonLink = '/contact',
	secondaryButtonText,
	secondaryButtonLink,
	showVolunteerCTA = true,
	showContactCTA = true,
	showNewsletterCTA = false,
	variant = 'full',
}: Readonly<UnifiedCTAProperties>) {
	// Build action buttons based on props
	const actions: CTAAction[] = [];

	if (primaryButtonText && primaryButtonLink) {
		actions.push({text: primaryButtonText, link: primaryButtonLink, variant: 'primary'});
	}

	if (secondaryButtonText && secondaryButtonLink) {
		actions.push({text: secondaryButtonText, link: secondaryButtonLink, variant: 'secondary'});
	}

	if (variant === 'minimal') {
		return (
			<section className='bg-gray-900 py-8 px-6' aria-labelledby='cta-title-minimal'>
				<div className='max-w-4xl mx-auto text-center'>
					<h2 id='cta-title-minimal' className='text-xl md:text-2xl font-bold text-white mb-4'>
						{title}
					</h2>
					<div className='flex flex-wrap justify-center gap-4'>
						{actions.map(action => (
							<a
								key={action.link}
								href={action.link}
								className={`inline-flex items-center gap-2 font-semibold py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
									action.variant === 'primary'
										? 'bg-[#ea247b] text-white hover:bg-[#d11d6d] focus:ring-[#ea247b]'
										: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white'
								}`}
							>
								{action.text}
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
								</svg>
							</a>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (variant === 'compact') {
		return (
			<section className='bg-gradient-to-r from-[#ea247b] to-[#d11d6d] py-10 px-6' aria-labelledby='cta-title-compact'>
				<div className='max-w-4xl mx-auto'>
					<div className='flex flex-col md:flex-row items-center justify-between gap-6'>
						<div className='text-center md:text-left'>
							<h2 id='cta-title-compact' className='text-xl md:text-2xl font-bold text-white mb-1'>
								{title}
							</h2>
							{subtitle && (
								<p className='text-white/90 text-sm md:text-base'>
									{subtitle}
								</p>
							)}
						</div>
						<div className='flex flex-wrap gap-3'>
							{actions.map(action => (
								<a
									key={action.link}
									href={action.link}
									className={`inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#ea247b] ${
										action.variant === 'primary'
											? 'bg-white text-[#ea247b] hover:bg-gray-100 focus:ring-white'
											: 'bg-white/10 text-white hover:bg-white/20 border border-white/30 focus:ring-white'
									}`}
								>
									{action.text}
									<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
									</svg>
								</a>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	// Full variant with feature cards
	return (
		<section className='bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-6' aria-labelledby='cta-title-full'>
			<div className='max-w-5xl mx-auto'>
				<div className='text-center mb-10'>
					<h2 id='cta-title-full' className='text-2xl md:text-3xl font-bold text-white mb-3'>
						{title}
					</h2>
					{subtitle && (
						<p className='text-gray-300 max-w-2xl mx-auto'>
							{subtitle}
						</p>
					)}
				</div>

				{/* Feature cards for different CTAs */}
				<div className='grid md:grid-cols-3 gap-6 mb-10'>
					{showVolunteerCTA && (
						<div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#ea247b]/50 transition-colors'>
							<div className='w-12 h-12 bg-[#ea247b]/20 rounded-xl flex items-center justify-center mb-4'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-[#ea247b]' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
								</svg>
							</div>
							<h3 className='text-lg font-bold text-white mb-2'>Word vrijwilliger</h3>
							<p className='text-gray-400 text-sm mb-4'>
								Help mee bij activiteiten en maak deel uit van een enthousiast team ouders.
							</p>
							<a
								href='/contact'
								className='inline-flex items-center gap-1 text-[#ea247b] font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 focus:ring-offset-gray-900 rounded'
							>
								Meld je aan
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					)}

					{showContactCTA && (
						<div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#ea247b]/50 transition-colors'>
							<div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
							</div>
							<h3 className='text-lg font-bold text-white mb-2'>Vragen of ideeën?</h3>
							<p className='text-gray-400 text-sm mb-4'>
								We staan open voor feedback, suggesties en nieuwe ideeën voor activiteiten.
							</p>
							<a
								href='/contact'
								className='inline-flex items-center gap-1 text-blue-400 font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded'
							>
								Stuur een bericht
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					)}

					{showNewsletterCTA && (
						<div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#ea247b]/50 transition-colors'>
							<div className='w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
								</svg>
							</div>
							<h3 className='text-lg font-bold text-white mb-2'>Blijf op de hoogte</h3>
							<p className='text-gray-400 text-sm mb-4'>
								Ontvang updates over activiteiten en nieuws direct in je inbox.
							</p>
							<a
								href='/contact'
								className='inline-flex items-center gap-1 text-amber-400 font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded'
							>
								Schrijf je in
								<svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
								</svg>
							</a>
						</div>
					)}
				</div>

				{/* Main CTA buttons */}
				<div className='flex flex-wrap justify-center gap-4'>
					{actions.map(action => (
						<a
							key={action.link}
							href={action.link}
							className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
								action.variant === 'primary'
									? 'bg-[#ea247b] text-white hover:bg-[#d11d6d] hover:shadow-lg hover:shadow-[#ea247b]/25 focus:ring-[#ea247b]'
									: 'bg-white/10 text-white hover:bg-white/20 border border-white/20 focus:ring-white'
							}`}
						>
							{action.text}
							<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' aria-hidden='true'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
							</svg>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

export const UnifiedCTAInfo = {
	name: 'UnifiedCTA',
	component: UnifiedCTA,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Doe mee met de Talentenraad',
			helperText: 'Hoofdtitel van de CTA sectie',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Heb je vragen, ideeën, of wil je meehelpen? We horen graag van je!',
			helperText: 'Ondertitel/beschrijving',
		},
		{
			name: 'primaryButtonText',
			type: 'string',
			defaultValue: 'Neem contact op',
		},
		{
			name: 'primaryButtonLink',
			type: 'string',
			defaultValue: '/contact',
		},
		{
			name: 'secondaryButtonText',
			type: 'string',
			helperText: 'Optionele tweede knop',
		},
		{
			name: 'secondaryButtonLink',
			type: 'string',
		},
		{
			name: 'showVolunteerCTA',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon "Word vrijwilliger" kaart (alleen bij full variant)',
		},
		{
			name: 'showContactCTA',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon "Vragen of ideeën" kaart (alleen bij full variant)',
		},
		{
			name: 'showNewsletterCTA',
			type: 'boolean',
			defaultValue: false,
			helperText: 'Toon "Blijf op de hoogte" kaart (alleen bij full variant)',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['compact', 'full', 'minimal'],
			defaultValue: 'full',
			helperText: 'compact: kleine balk, full: met feature kaarten, minimal: alleen titel en knoppen',
		},
	],
};
