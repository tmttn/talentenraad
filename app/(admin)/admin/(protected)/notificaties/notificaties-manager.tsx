'use client';

import {useState, useEffect} from 'react';
import {Send, Users, Bell, Clock, CheckCircle, XCircle, Loader2} from 'lucide-react';

type NotificationHistoryEntry = {
	id: string;
	title: string;
	body: string;
	url: string | null;
	topic: string | null;
	sentAt: string;
	recipientCount: number | null;
	successCount: number | null;
	failureCount: number | null;
};

type NotificationData = {
	history: NotificationHistoryEntry[];
	subscriberCount: number;
};

export function NotificatiesManager() {
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [url, setUrl] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);
	const [data, setData] = useState<NotificationData | null>(null);

	const fetchData = async () => {
		try {
			const response = await fetch('/api/admin/notifications');
			if (response.ok) {
				const result = await response.json() as NotificationData;
				setData(result);
			}
		} catch (error) {
			console.error('Failed to fetch notifications data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!title.trim() || !body.trim()) {
			setMessage({type: 'error', text: 'Titel en bericht zijn verplicht'});
			return;
		}

		setIsSending(true);
		setMessage(null);

		try {
			const response = await fetch('/api/admin/notifications', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					title: title.trim(),
					body: body.trim(),
					url: url.trim() || undefined,
				}),
			});

			const result = await response.json() as {success: boolean; sent?: number; failed?: number; error?: string};

			if (response.ok && result.success) {
				setMessage({
					type: 'success',
					text: `Notificatie verzonden naar ${result.sent ?? 0} abonnees${result.failed ? ` (${result.failed} mislukt)` : ''}`,
				});
				setTitle('');
				setBody('');
				setUrl('');
				// Refresh data
				await fetchData();
			} else {
				setMessage({
					type: 'error',
					text: result.error ?? 'Verzenden mislukt',
				});
			}
		} catch {
			setMessage({type: 'error', text: 'Verzenden mislukt'});
		} finally {
			setIsSending(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('nl-BE', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	return (
		<div className='space-y-8'>
			{/* Stats */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<div className='flex items-center gap-3'>
					<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
						<Users className='w-6 h-6 text-primary' />
					</div>
					<div>
						<p className='text-sm text-gray-500'>Abonnees</p>
						<p className='text-2xl font-bold text-gray-900'>
							{isLoading ? '...' : (data?.subscriberCount ?? 0)}
						</p>
					</div>
				</div>
			</div>

			{/* Send notification form */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
					<Bell className='w-5 h-5' />
					Nieuwe notificatie versturen
				</h2>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
							Titel
						</label>
						<input
							type='text'
							id='title'
							value={title}
							onChange={e => {
								setTitle(e.target.value);
							}}
							placeholder='Bijv. Nieuwe activiteit!'
							className='w-full px-4 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent'
							maxLength={50}
						/>
					</div>

					<div>
						<label htmlFor='body' className='block text-sm font-medium text-gray-700 mb-1'>
							Bericht
						</label>
						<textarea
							id='body'
							value={body}
							onChange={e => {
								setBody(e.target.value);
							}}
							placeholder='Het bericht dat gebruikers zien...'
							rows={3}
							className='w-full px-4 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent resize-none'
							maxLength={200}
						/>
					</div>

					<div>
						<label htmlFor='url' className='block text-sm font-medium text-gray-700 mb-1'>
							Link (optioneel)
						</label>
						<input
							type='text'
							id='url'
							value={url}
							onChange={e => {
								setUrl(e.target.value);
							}}
							placeholder='Bijv. /activiteiten/kerstmarkt'
							className='w-full px-4 py-2 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent'
						/>
						<p className='mt-1 text-xs text-gray-500'>
							Waar gebruikers naartoe gaan als ze op de notificatie klikken
						</p>
					</div>

					{message && (
						<div className={`p-4 rounded-button flex items-center gap-2 ${
							message.type === 'success'
								? 'bg-green-50 text-green-700'
								: 'bg-red-50 text-red-700'
						}`}>
							{message.type === 'success' ? (
								<CheckCircle className='w-5 h-5' />
							) : (
								<XCircle className='w-5 h-5' />
							)}
							{message.text}
						</div>
					)}

					<button
						type='submit'
						disabled={isSending || !title.trim() || !body.trim()}
						className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isSending ? (
							<Loader2 className='w-5 h-5 animate-spin' />
						) : (
							<Send className='w-5 h-5' />
						)}
						{isSending ? 'Versturen...' : 'Versturen'}
					</button>
				</form>
			</div>

			{/* History */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
					<Clock className='w-5 h-5' />
					Verzonden notificaties
				</h2>

				{isLoading ? (
					<div className='flex items-center justify-center py-8'>
						<Loader2 className='w-6 h-6 animate-spin text-gray-400' />
					</div>
				) : data?.history && data.history.length > 0 ? (
					<div className='space-y-3'>
						{data.history.map(entry => (
							<div
								key={entry.id}
								className='p-4 bg-gray-50 rounded-button'
							>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex-1 min-w-0'>
										<p className='font-medium text-gray-900 truncate'>{entry.title}</p>
										<p className='text-sm text-gray-600 mt-1 line-clamp-2'>{entry.body}</p>
										{entry.url && (
											<p className='text-xs text-gray-400 mt-1 truncate'>
												→ {entry.url}
											</p>
										)}
									</div>
									<div className='text-right flex-shrink-0'>
										<p className='text-xs text-gray-500'>{formatDate(entry.sentAt)}</p>
										<div className='flex items-center gap-2 mt-1 text-xs'>
											<span className='text-green-600'>
												{entry.successCount ?? 0} ✓
											</span>
											{(entry.failureCount ?? 0) > 0 && (
												<span className='text-red-500'>
													{entry.failureCount} ✗
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className='text-gray-500 text-center py-8'>
						Nog geen notificaties verzonden
					</p>
				)}
			</div>
		</div>
	);
}
