'use client';

import {
	Heart,
	User,
	Calendar,
	Star,
	Gift,
	GraduationCap,
	DollarSign,
	MessageCircle,
	Users,
	Mail,
	MapPin,
	Phone,
	type LucideIcon,
} from 'lucide-react';
import {AnimatedLink} from '@components/ui';

type IconType = 'heart' | 'users' | 'calendar' | 'star' | 'gift' | 'school' | 'money' | 'chat' | 'team' | 'email' | 'location' | 'phone';

type InfoCardProperties = {
	title: string;
	description: string;
	icon?: IconType;
	link?: string;
	linkText?: string;
	variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'gradient';
};

const iconComponents: Record<IconType, LucideIcon> = {
	heart: Heart,
	users: User,
	calendar: Calendar,
	star: Star,
	gift: Gift,
	school: GraduationCap,
	money: DollarSign,
	chat: MessageCircle,
	team: Users,
	email: Mail,
	location: MapPin,
	phone: Phone,
};

function Icon({name}: Readonly<{name: IconType}>) {
	const IconComponent = iconComponents[name];
	return <IconComponent className='h-8 w-8' aria-hidden='true' />;
}

const variantStyles = {
	default: {
		card: 'bg-white',
		iconBg: 'bg-primary/10 text-primary-text group-hover:bg-primary group-hover:text-white',
		title: 'text-gray-800',
		description: 'text-gray-600',
	},
	primary: {
		card: 'bg-gradient-to-br from-brand-primary-500 to-brand-primary-600',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
	},
	secondary: {
		card: 'bg-gradient-to-br from-brand-secondary-400 to-brand-secondary-500',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
	},
	accent: {
		card: 'bg-gradient-to-br from-brand-accent-400 to-brand-accent-500',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
	},
	gradient: {
		card: 'bg-gradient-to-br from-brand-primary-500 via-brand-accent-400 to-brand-secondary-400',
		iconBg: 'bg-white/20 text-white',
		title: 'text-white',
		description: 'text-white/90',
	},
};

const cardBaseClassName = [
	'p-8 shadow-md hover:shadow-xl transition-all duration-300',
	'text-center group relative overflow-hidden',
].join(' ');

const iconContainerBase = 'inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300';

function InfoCard({
	title,
	description,
	icon = 'star',
	link,
	linkText = 'Meer info',
	variant = 'default',
}: Readonly<InfoCardProperties>) {
	// Fallback to 'default' if variant is not recognized
	const styles = variantStyles[variant] ?? variantStyles.default;
	const hoverScale = variant === 'default' ? 'group-hover:scale-110' : '';

	return (
		<div className={`${cardBaseClassName} ${styles.card}`}>
			{/* Decorative elements for colored variants */}
			{variant !== 'default' && (
				<>
					<div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2' />
					<div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2' />
				</>
			)}

			<div className='relative z-10'>
				<div className={`${iconContainerBase} ${hoverScale} ${styles.iconBg}`}>
					<Icon name={icon} />
				</div>
				<h3 className={`text-xl font-bold mb-3 ${styles.title}`}>{title}</h3>
				<p className={`whitespace-pre-line ${styles.description}`}>{description}</p>
				{link && (
					<AnimatedLink
						href={link}
						size='sm'
						variant={variant === 'default' ? 'primary' : 'white'}
						className='mt-4'
					>
						{linkText}
					</AnimatedLink>
				)}
			</div>
		</div>
	);
}

export const InfoCardInfo = {
	name: 'InfoCard',
	component: InfoCard,
	inputs: [
		{
			name: 'title',
			type: 'string',
			required: true,
			defaultValue: 'Activiteiten',
		},
		{
			name: 'description',
			type: 'longText',
			required: true,
			defaultValue: 'Wij organiseren leuke activiteiten voor kinderen en ouders.',
		},
		{
			name: 'icon',
			type: 'string',
			enum: ['heart', 'users', 'calendar', 'star', 'gift', 'school', 'money', 'chat', 'team', 'email', 'location', 'phone'],
			defaultValue: 'star',
		},
		{
			name: 'variant',
			type: 'string',
			enum: ['default', 'primary', 'secondary', 'accent', 'gradient'],
			defaultValue: 'default',
			helperText: 'Kleurvariant van de kaart',
		},
		{
			name: 'link',
			type: 'string',
		},
		{
			name: 'linkText',
			type: 'string',
			defaultValue: 'Meer info',
		},
	],
};
