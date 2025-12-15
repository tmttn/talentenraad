'use client';

type TypographyProperties = {
	text: string;
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'body' | 'small' | 'caption';
	color?: 'default' | 'muted' | 'primary' | 'secondary' | 'accent' | 'white';
	align?: 'left' | 'center' | 'right';
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
};

function Typography({
	text,
	variant = 'body',
	color = 'default',
	align = 'left',
	weight,
}: Readonly<TypographyProperties>) {
	const variantClasses = {
		h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
		h2: 'text-3xl md:text-4xl font-bold leading-tight',
		h3: 'text-2xl md:text-3xl font-semibold leading-snug',
		h4: 'text-xl md:text-2xl font-semibold leading-snug',
		lead: 'text-lg md:text-xl leading-relaxed',
		body: 'text-base leading-relaxed',
		small: 'text-sm leading-normal',
		caption: 'text-xs leading-normal uppercase tracking-wide',
	};

	const colorClasses = {
		default: 'text-gray-900',
		muted: 'text-gray-600',
		primary: 'text-primary',
		secondary: 'text-secondary',
		accent: 'text-accent',
		white: 'text-white',
	};

	const alignClasses = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right',
	};

	const weightClasses = {
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold',
	};

	// Determine the HTML element based on variant
	const getElement = () => {
		switch (variant) {
			case 'h1': {
				return 'h1';
			}

			case 'h2': {
				return 'h2';
			}

			case 'h3': {
				return 'h3';
			}

			case 'h4': {
				return 'h4';
			}

			case 'caption': {
				return 'span';
			}

			default: {
				return 'p';
			}
		}
	};

	const Element = getElement();

	const classes = [
		variantClasses[variant],
		colorClasses[color],
		alignClasses[align],
		weight ? weightClasses[weight] : '',
		'whitespace-pre-line', // Preserve line breaks from Builder
	].filter(Boolean).join(' ');

	return (
		<Element className={classes}>
			{text}
		</Element>
	);
}

export const TypographyInfo = {
	name: 'Typography',
	component: Typography,
	inputs: [
		{
			name: 'text',
			type: 'longText',
			required: true,
			helperText: 'De tekst die wordt weergegeven',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['h1', 'h2', 'h3', 'h4', 'lead', 'body', 'small', 'caption'],
			defaultValue: 'body',
			helperText: 'Tekststijl: h1-h4=koppen, lead=intro tekst, body=normale tekst, small=kleine tekst, caption=label',
		},
		{
			name: 'color',
			type: 'string',
			enum: ['default', 'muted', 'primary', 'secondary', 'accent', 'white'],
			defaultValue: 'default',
			helperText: 'Tekstkleur: primary=roze, secondary=groen, accent=oranje, muted=grijs',
		},
		{
			name: 'align',
			type: 'string',
			enum: ['left', 'center', 'right'],
			defaultValue: 'left',
			helperText: 'Tekstuitlijning',
		},
		{
			name: 'weight',
			type: 'string',
			enum: ['normal', 'medium', 'semibold', 'bold'],
			helperText: 'Optioneel: overschrijf het standaard lettergewicht van de variant',
		},
	],
};
