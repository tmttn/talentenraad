import {
	Info,
	AlertTriangle,
	Star,
	X,
} from 'lucide-react';

export type AnnouncementType = 'info' | 'waarschuwing' | 'belangrijk';

export type AnnouncementData = {
	tekst: string;
	type: AnnouncementType;
	link?: string;
	linkTekst?: string;
};

export type AnnouncementDisplayProps = {
	announcement: AnnouncementData;
	onDismiss?: () => void;
};

const typeStyles: Record<AnnouncementType, {bg: string; icon: React.ReactNode}> = {
	info: {
		bg: 'bg-info-600',
		icon: <Info className='h-5 w-5' aria-hidden='true' />,
	},
	waarschuwing: {
		bg: 'bg-warning-500',
		icon: <AlertTriangle className='h-5 w-5' aria-hidden='true' />,
	},
	belangrijk: {
		bg: 'bg-primary',
		icon: <Star className='h-5 w-5' aria-hidden='true' />,
	},
};

export function AnnouncementDisplay({announcement, onDismiss}: AnnouncementDisplayProps) {
	const style = typeStyles[announcement.type] ?? typeStyles.info;

	return (
		<div className={`${style.bg} text-white`} role='alert'>
			<div className='max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4'>
				<div className='flex items-center gap-3 flex-1'>
					<span className='flex-shrink-0' aria-hidden='true'>{style.icon}</span>
					<p className='text-sm font-medium'>
						{announcement.tekst}
						{announcement.link && announcement.linkTekst && (
							<a
								href={announcement.link}
								className='ml-2 underline hover:no-underline font-bold'
							>
								{announcement.linkTekst} →
							</a>
						)}
					</p>
				</div>
				{onDismiss && (
					<button
						type='button'
						onClick={onDismiss}
						className='flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors'
						aria-label='Aankondiging sluiten'
					>
						<X className='h-5 w-5' aria-hidden='true' />
					</button>
				)}
			</div>
		</div>
	);
}
