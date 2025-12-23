'use client';

import {useEffect, useState} from 'react';
import {Container, Grid} from '@components/ui/layout';
import {useFlag} from '@lib/flags-client';

type TeamMemberData = {
	name: string;
	role: string;
	image?: string;
	description?: string;
};

type BuilderTeamMember = {
	id: string;
	data: {
		naam: string;
		rol: string;
		beschrijving?: string;
		afbeelding?: string;
		categorie: 'bestuur' | 'lid' | 'helper';
		volgorde?: number;
		actief?: boolean;
	};
};

type TeamGridProperties = {
	columns?: 2 | 3 | 4;
	showDescription?: boolean;
	category?: 'bestuur' | 'lid' | 'helper' | '';
};

// Use environment variable for API key
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY; // eslint-disable-line n/prefer-global/process

function TeamGrid({
	columns = 3,
	showDescription = true,
	category = '',
}: Readonly<TeamGridProperties>) {
	const isEnabled = useFlag('teamGrid');
	const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchTeamMembers() {
			if (!builderApiKey) {
				console.error('Builder.io API key not configured');
				setLoading(false);
				return;
			}

			try {
				const url = new URL('https://cdn.builder.io/api/v3/content/teamlid');
				url.searchParams.set('apiKey', builderApiKey);
				url.searchParams.set('limit', '50');
				url.searchParams.set('cachebust', 'true');

				if (category) {
					url.searchParams.set('query.data.categorie.$eq', category);
				}

				const response = await fetch(url.toString(), {cache: 'no-store'});
				const data = await response.json() as {results?: BuilderTeamMember[]};

				if (data.results && data.results.length > 0) {
					const activeMembers = data.results
						.filter((item: BuilderTeamMember) => item.data.actief !== false)
						.sort((a: BuilderTeamMember, b: BuilderTeamMember) => {
							const orderA = a.data.volgorde ?? 99;
							const orderB = b.data.volgorde ?? 99;
							return orderA - orderB;
						})
						.map((item: BuilderTeamMember) => ({
							name: item.data.naam,
							role: item.data.rol,
							description: item.data.beschrijving,
							image: item.data.afbeelding,
						}));

					setTeamMembers(activeMembers);
				}
			} catch (error) {
				console.error('Error fetching team members:', error);
			} finally {
				setLoading(false);
			}
		}

		void fetchTeamMembers();
	}, [category]);

	const getInitials = (fullName: string) => fullName
		.split(' ')
		.map(n => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	// Map columns prop to responsive Grid props
	const getGridColsLg = (cols: number): 2 | 3 | 4 => {
		if (cols === 2) {
			return 2;
		}

		if (cols === 4) {
			return 4;
		}

		return 3;
	};

	const avatarColors = [
		'from-brand-primary-500 to-brand-primary-700',
		'from-[#7c3aed] to-[#5b21b6]',
		'from-[#0891b2] to-[#0e7490]',
		'from-[#059669] to-[#047857]',
		'from-[#d97706] to-[#b45309]',
	];

	if (loading) {
		return (
			<Container size='xl' className='animate-pulse'>
				<Grid cols={1} colsMd={2} colsLg={getGridColsLg(columns)} gap='lg'>
					{[1, 2, 3].map(i => (
						<div key={i} className='text-center'>
							<div className='w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4' />
							<div className='h-6 bg-gray-200 rounded w-32 mx-auto mb-2' />
							<div className='h-4 bg-gray-200 rounded w-24 mx-auto' />
						</div>
					))}
				</Grid>
			</Container>
		);
	}

	if (teamMembers.length === 0) {
		return (
			<Container size='xl' className='text-center py-12 text-gray-500'>
				Geen teamleden gevonden
			</Container>
		);
	}

	// Check feature flag
	if (!isEnabled) {
		return null;
	}

	return (
		<Container size='xl'>
			<Grid cols={1} colsMd={2} colsLg={getGridColsLg(columns)} gap='lg'>
				{teamMembers.map((member, index) => (
					<div key={index} className='text-center group'>
						<div className='relative mb-5 inline-block'>
							<div className={[
								'w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center',
								'shadow-elevated group-hover:shadow-floating transition-shadow',
								avatarColors[index % avatarColors.length],
							].join(' ')}>
								<span className='text-white font-bold text-3xl'>
									{getInitials(member.name)}
								</span>
							</div>
							<div className='absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-base'>
								<span className='text-xs font-semibold text-primary'>
									{member.role}
								</span>
							</div>
						</div>
						<h3 className='text-xl font-bold text-gray-900 mt-4'>
							{member.name}
						</h3>
						{showDescription && member.description && (
							<p className='text-gray-600 text-sm mt-2 max-w-xs mx-auto'>
								{member.description}
							</p>
						)}
					</div>
				))}
			</Grid>
		</Container>
	);
}

export const TeamGridInfo = {
	name: 'TeamGrid',
	component: TeamGrid,
	inputs: [
		{
			name: 'columns',
			type: 'number',
			enum: [
				{label: '2 kolommen', value: 2},
				{label: '3 kolommen', value: 3},
				{label: '4 kolommen', value: 4},
			],
			defaultValue: 3,
			helperText: 'Aantal kolommen in het grid',
		},
		{
			name: 'showDescription',
			type: 'boolean',
			defaultValue: true,
			helperText: 'Toon beschrijving onder teamleden',
		},
		{
			name: 'category',
			type: 'string',
			enum: [
				{label: 'Alle teamleden', value: ''},
				{label: 'Alleen bestuur', value: 'bestuur'},
				{label: 'Alleen leden', value: 'lid'},
				{label: 'Alleen helpers', value: 'helper'},
			],
			defaultValue: '',
			helperText: 'Filter op categorie',
		},
	],
};
