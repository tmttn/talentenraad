'use client';

import {Loader2} from 'lucide-react';
import {usePushNotifications} from '@/lib/hooks/use-push-notifications';
// eslint-disable-next-line import-x/extensions
import {useFlag} from '@/lib/flags-client';

type NotificationToggleProperties = {
	className?: string;
};

export function NotificationToggle({className = ''}: Readonly<NotificationToggleProperties>) {
	const isEnabled = useFlag('pushNotifications');
	const {isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe} = usePushNotifications();

	// Don't render if feature flag is disabled or not supported
	if (!isEnabled || !isSupported) {
		return null;
	}

	const handleToggle = async () => {
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
			onClick={handleToggle}
			disabled={isLoading}
			className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
				isSubscribed
					? 'bg-primary/10 text-primary hover:bg-primary/20'
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
			} disabled:opacity-50 ${className}`}
		>
			{isLoading ? (
				<Loader2 className='w-4 h-4 animate-spin' />
			) : (
				<span
					className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
						isSubscribed ? 'bg-primary' : 'bg-gray-300'
					}`}
				>
					<span
						className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
							isSubscribed ? 'translate-x-4' : 'translate-x-0.5'
						}`}
					/>
				</span>
			)}
			<span className='whitespace-nowrap'>
				{isSubscribed ? 'Notificaties aan' : 'Notificaties uit'}
			</span>
		</button>
	);
}
