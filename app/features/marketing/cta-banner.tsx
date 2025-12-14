'use client';

type CtaBannerProperties = {
	variant?: 'default' | 'accent' | 'light';
};

function CtaBanner({
	variant = 'default',
}: Readonly<CtaBannerProperties>) {
	const variants = {
		default: 'bg-gray-900',
		accent: 'bg-gradient-to-r from-brand-primary-500 to-brand-primary-700',
		light: 'bg-gray-100',
	};

	const bg = variants[variant] ?? variants.default;

	return (
		<section className={`py-12 md:py-16 ${bg}`} />
	);
}

export const CtaBannerInfo = {
	name: 'CTABanner',
	component: CtaBanner,
	inputs: [
		{
			name: 'variant',
			type: 'string',
			enum: ['default', 'accent', 'light'],
			defaultValue: 'default',
			helperText: 'default: donkergrijs, accent: primaire kleur gradient, light: lichtgrijs',
		},
	],
};
