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

async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout>;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		clearTimeout(timeoutId!);
	}
}

async function getServiceWorkerRegistration(timeoutMs = 5000): Promise<ServiceWorkerRegistration> {
	// First check if there's a controller - if not, SW might need to be registered
	if (!navigator.serviceWorker.controller) {
		// Try to register manually
		try {
			await navigator.serviceWorker.register('/serwist/sw.js', {scope: '/'});
		} catch {
			// Ignore registration errors - ready might still work
		}
	}

	return withTimeout(
		navigator.serviceWorker.ready,
		timeoutMs,
		'Service worker niet beschikbaar',
	);
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
				const registration = await getServiceWorkerRegistration();
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

			// Denied permission check
			if (Notification.permission === 'denied') {
				setState(s => ({
					...s,
					isLoading: false,
					permission: 'denied',
					error: 'Notificaties geblokkeerd in browser',
				}));
				return;
			}

			// Get VAPID public key with timeout
			const response = await withTimeout(
				fetch('/api/push/vapid-public-key'),
				10_000,
				'VAPID key ophalen duurde te lang',
			);
			if (!response.ok) {
				throw new Error('VAPID key niet beschikbaar');
			}

			const {publicKey} = await response.json() as {publicKey: string};

			const registration = await getServiceWorkerRegistration();

			// Subscribe to push with timeout
			const subscription = await withTimeout(
				registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicKey),
				}),
				10_000,
				'Push abonnement duurde te lang',
			);

			// Send subscription to server with timeout
			const subscribeResponse = await withTimeout(
				fetch('/api/push/subscribe', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						...subscription.toJSON(),
						topics,
					}),
				}),
				10_000,
				'Abonnement opslaan duurde te lang',
			);

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
			// Try to get existing subscription and unsubscribe
			const registrations = await navigator.serviceWorker.getRegistrations();

			for (const registration of registrations) {
				try {
					const subscription = await registration.pushManager.getSubscription();
					if (subscription) {
						// Try to notify server first
						try {
							await fetch('/api/push/subscribe', {
								method: 'DELETE',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({endpoint: subscription.endpoint}),
							});
						} catch {
							// Ignore server errors
						}

						// Unsubscribe from browser
						await subscription.unsubscribe();
					}
				} catch {
					// Ignore individual registration errors
				}
			}

			setState(s => ({...s, isSubscribed: false, isLoading: false}));
		} catch {
			// Even if unsubscribe fails, mark as unsubscribed locally
			setState(s => ({
				...s,
				isSubscribed: false,
				isLoading: false,
				error: 'Kon niet volledig uitschrijven',
			}));
		}
	}, []);

	return {...state, subscribe, unsubscribe};
}
