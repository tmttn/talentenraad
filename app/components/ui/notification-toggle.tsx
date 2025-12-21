'use client';

import {Bell, BellOff, Loader2} from 'lucide-react';
import {usePushNotifications} from '@/lib/hooks/use-push-notifications';

type NotificationToggleProperties = {
	className?: string;
};

export function NotificationToggle({className = ''}: Readonly<NotificationToggleProperties>) {
	const {isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe} = usePushNotifications();

	// Don't render anything if not supported
	if (!isSupported) {
		return null;
	}

	const handleClick = async () => {
		if (permission === 'denied') {
			// Show alert about blocked notifications
			// eslint-disable-next-line no-alert
			alert('Je hebt notificaties geblokkeerd. Wijzig dit in je browserinstellingen.');
			return;
		}

		if (isSubscribed) {
			await unsubscribe();
		} else {
			await subscribe(['nieuws', 'activiteiten']);
		}
	};

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={isLoading}
			title={isSubscribed ? 'Notificaties uitschakelen' : 'Notificaties inschakelen'}
			aria-label={isSubscribed ? 'Notificaties uitschakelen' : 'Notificaties inschakelen'}
			className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
				isSubscribed
					? 'text-primary hover:bg-primary/10'
					: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
			} ${className}`}
		>
			{isLoading ? (
				<Loader2 className='w-5 h-5 animate-spin' />
			) : isSubscribed ? (
				<Bell className='w-5 h-5' />
			) : (
				<BellOff className='w-5 h-5' />
			)}
		</button>
	);
}
