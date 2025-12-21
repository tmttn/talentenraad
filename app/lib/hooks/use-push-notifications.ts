'use client';

import {useState, useEffect, useCallback} from 'react';

type PushNotificationState = {
	isSupported: boolean;
	isSubscribed: boolean;
	isLoading: boolean;
	permission: NotificationPermission | 'unsupported';
	error: string | null;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
	const rawData = atob(base64);
	const buffer = new ArrayBuffer(rawData.length);
	const outputArray = new Uint8Array(buffer);
	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}

export function usePushNotifications() {
	const [state, setState] = useState<PushNotificationState>({
		isSupported: false,
		isSubscribed: false,
		isLoading: true,
		permission: 'unsupported',
		error: null,
	});

	useEffect(() => {
		const checkSupport = async () => {
			const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

			if (!isSupported) {
				setState(s => ({...s, isLoading: false, permission: 'unsupported'}));
				return;
			}

			const permission = Notification.permission;

			// Set supported immediately so bell shows - don't wait for SW ready
			setState({
				isSupported: true,
				isSubscribed: false,
				isLoading: false,
				permission,
				error: null,
			});

			// Check subscription status in background (don't block on this)
			try {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				if (subscription) {
					setState(s => ({...s, isSubscribed: true}));
				}
			} catch {
				// Silently ignore - SW might not be ready yet
			}
		};

		checkSupport();
	}, []);

	const subscribe = useCallback(async (topics?: string[]) => {
		setState(s => ({...s, isLoading: true, error: null}));

		try {
			// Request permission if not already granted
			if (Notification.permission === 'default') {
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					setState(s => ({
						...s,
						isLoading: false,
						permission,
						error: 'Notificaties niet toegestaan',
					}));
					return;
				}
			}

			// Get VAPID public key
			const response = await fetch('/api/push/vapid-public-key');
			if (!response.ok) {
				throw new Error('VAPID key niet beschikbaar');
			}

			const {publicKey} = await response.json() as {publicKey: string};

			const registration = await navigator.serviceWorker.ready;

			// Subscribe to push
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(publicKey),
			});

			// Send subscription to server
			const subscribeResponse = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					...subscription.toJSON(),
					topics,
				}),
			});

			if (!subscribeResponse.ok) {
				throw new Error('Kon abonnement niet opslaan');
			}

			setState(s => ({
				...s,
				isSubscribed: true,
				isLoading: false,
				permission: 'granted',
			}));
		} catch (error) {
			setState(s => ({
				...s,
				isLoading: false,
				error: error instanceof Error ? error.message : 'Kon niet abonneren op notificaties',
			}));
		}
	}, []);

	const unsubscribe = useCallback(async () => {
		setState(s => ({...s, isLoading: true, error: null}));

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				await subscription.unsubscribe();
				await fetch('/api/push/subscribe', {
					method: 'DELETE',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({endpoint: subscription.endpoint}),
				});
			}

			setState(s => ({...s, isSubscribed: false, isLoading: false}));
		} catch {
			setState(s => ({
				...s,
				isLoading: false,
				error: 'Kon niet uitschrijven',
			}));
		}
	}, []);

	return {...state, subscribe, unsubscribe};
}
