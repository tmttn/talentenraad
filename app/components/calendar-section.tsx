'use client';

type CalendarEvent = {
	date: string;
	title: string;
	time?: string;
};

type CalendarSectionProperties = {
	title?: string;
	subtitle?: string;
	events?: CalendarEvent[];
	showViewAll?: boolean;
	viewAllLink?: string;
};

function CalendarSection({
	title = 'Komende activiteiten',
	subtitle,
	events = [],
	showViewAll = true,
	viewAllLink = '/kalender',
}: Readonly<CalendarSectionProperties>) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleDateString('nl-BE', {month: 'short'}).toUpperCase();
		return {day, month};
	};

	return (
		<section className="py-16 px-6" aria-labelledby="calendar-section-title">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					{title && (
						<h2 id="calendar-section-title" className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
							{title}
						</h2>
					)}
					{subtitle && (
						<p className="text-gray-600">{subtitle}</p>
					)}
				</div>

				{events.length > 0 ? (
					<div className="space-y-4">
						{events.map((event, index) => {
							const {day, month} = formatDate(event.date);
							return (
								<div
									key={index}
									className="flex items-center gap-6 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
								>
									<div className="flex-shrink-0 w-16 h-16 bg-[#ea247b] rounded-xl flex flex-col items-center justify-center text-white">
										<span className="text-2xl font-bold leading-none">{day}</span>
										<span className="text-xs uppercase">{month}</span>
									</div>
									<div className="flex-grow">
										<h3 className="font-bold text-gray-800">{event.title}</h3>
										{event.time && (
											<p className="text-sm text-gray-500 flex items-center gap-1">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{event.time}
											</p>
										)}
									</div>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12 bg-gray-100 rounded-2xl">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<p className="text-gray-500">Geen activiteiten gepland</p>
					</div>
				)}

				{showViewAll && events.length > 0 && (
					<div className="text-center mt-8">
						<a
							href={viewAllLink}
							className="inline-flex items-center gap-2 text-[#ea247b] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[#ea247b] focus:ring-offset-2 rounded"
						>
							Bekijk alle activiteiten
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</a>
					</div>
				)}
			</div>
		</section>
	);
}

export const CalendarSectionInfo = {
	name: 'CalendarSection',
	component: CalendarSection,
	inputs: [
		{
			name: 'title',
			type: 'string',
			defaultValue: 'Komende activiteiten',
		},
		{
			name: 'subtitle',
			type: 'string',
			defaultValue: 'Mis geen enkele activiteit van de Talentenraad',
		},
		{
			name: 'events',
			type: 'list',
			subFields: [
				{
					name: 'date',
					type: 'date',
					required: true,
				},
				{
					name: 'title',
					type: 'string',
					required: true,
				},
				{
					name: 'time',
					type: 'string',
				},
			],
			defaultValue: [
				{date: '2025-03-15', title: 'Schoolfeest', time: '14:00 - 18:00'},
				{date: '2025-04-20', title: 'Quiz avond', time: '19:30'},
				{date: '2025-05-11', title: 'Moederdag ontbijt', time: '09:00 - 12:00'},
			],
		},
		{
			name: 'showViewAll',
			type: 'boolean',
			defaultValue: true,
		},
		{
			name: 'viewAllLink',
			type: 'string',
			defaultValue: '/kalender',
		},
	],
};
