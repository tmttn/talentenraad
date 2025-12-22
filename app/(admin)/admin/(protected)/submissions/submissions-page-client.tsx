'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import type {Submission, Feedback} from '@/lib/db/index.js';
import {SubmissionsTable} from '@/features/admin/submissions-table';
import {FeedbackTable} from '@/features/admin/feedback-table';
import {Mail, MessageSquare} from 'lucide-react';

type UnreadCounts = {
	submissions: number;
	feedback: number;
};

type SubmissionsPageClientProps = {
	inboxSubmissions: Submission[];
	archivedSubmissions: Submission[];
	feedbackItems: Feedback[];
	unreadCounts?: UnreadCounts;
};

type TabType = 'inbox' | 'archived' | 'feedback';

export function SubmissionsPageClient({
	inboxSubmissions,
	archivedSubmissions,
	feedbackItems,
	unreadCounts,
}: SubmissionsPageClientProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<TabType>('inbox');

	// Mark feedback as read when viewing the feedback tab
	useEffect(() => {
		if (activeTab === 'feedback' && unreadCounts?.feedback && unreadCounts.feedback > 0) {
			// Mark all unread feedback as read
			fetch('/api/admin/feedback', {
				method: 'PATCH',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({action: 'markAllRead'}),
			}).then(() => {
				router.refresh();
			}).catch(() => {
				// Silently fail
			});
		}
	}, [activeTab, unreadCounts?.feedback, router]);

	const submissions = activeTab === 'inbox' ? inboxSubmissions : archivedSubmissions;
	const isArchiveView = activeTab === 'archived';

	const getItemCount = () => {
		if (activeTab === 'feedback') return feedbackItems.length;
		return submissions.length;
	};

	const getItemLabel = () => {
		if (activeTab === 'feedback') {
			return feedbackItems.length === 1 ? 'feedback' : 'feedbacks';
		}

		return submissions.length === 1 ? 'bericht' : 'berichten';
	};

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 sm:mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Berichten</h1>
				<p className='text-gray-500 text-sm sm:text-base'>
					{getItemCount()} {getItemLabel()}
				</p>
			</div>

			{/* Tabs */}
			<div className='flex gap-1 mb-6 bg-gray-100 p-1 rounded-button w-fit'>
				<button
					type='button'
					onClick={() => setActiveTab('inbox')}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'inbox'
							? 'bg-white text-gray-900 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					Inbox
					{inboxSubmissions.length > 0 && (
						<span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
							unreadCounts?.submissions && unreadCounts.submissions > 0
								? 'bg-red-500 text-white'
								: activeTab === 'inbox'
									? 'bg-primary/10 text-primary-text'
									: 'bg-gray-200 text-gray-600'
						}`}>
							{unreadCounts?.submissions && unreadCounts.submissions > 0
								? unreadCounts.submissions
								: inboxSubmissions.length}
						</span>
					)}
				</button>
				<button
					type='button'
					onClick={() => setActiveTab('archived')}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'archived'
							? 'bg-white text-gray-900 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					Archief
					{archivedSubmissions.length > 0 && (
						<span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
							activeTab === 'archived'
								? 'bg-gray-600 text-white'
								: 'bg-gray-200 text-gray-600'
						}`}>
							{archivedSubmissions.length}
						</span>
					)}
				</button>
				<button
					type='button'
					onClick={() => setActiveTab('feedback')}
					className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
						activeTab === 'feedback'
							? 'bg-white text-gray-900 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					Feedback
					{feedbackItems.length > 0 && (
						<span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
							unreadCounts?.feedback && unreadCounts.feedback > 0
								? 'bg-red-500 text-white'
								: activeTab === 'feedback'
									? 'bg-yellow-100 text-yellow-700'
									: 'bg-gray-200 text-gray-600'
						}`}>
							{unreadCounts?.feedback && unreadCounts.feedback > 0
								? unreadCounts.feedback
								: feedbackItems.length}
						</span>
					)}
				</button>
			</div>

			{activeTab === 'feedback' ? (
				feedbackItems.length > 0 ? (
					<FeedbackTable feedbackItems={feedbackItems} />
				) : (
					<div className='bg-white rounded-card shadow-base p-8 sm:p-12 text-center'>
						<MessageSquare className='mx-auto text-gray-300 mb-4 h-12 w-12' aria-hidden='true' />
						<p className='text-gray-500 text-base sm:text-lg'>
							Nog geen feedback ontvangen.
						</p>
					</div>
				)
			) : submissions.length > 0 ? (
				<SubmissionsTable submissions={submissions} isArchiveView={isArchiveView} />
			) : (
				<div className='bg-white rounded-card shadow-base p-8 sm:p-12 text-center'>
					<Mail className='mx-auto text-gray-300 mb-4 h-12 w-12' aria-hidden='true' />
					<p className='text-gray-500 text-base sm:text-lg'>
						{isArchiveView
							? 'Geen gearchiveerde berichten.'
							: 'Nog geen berichten ontvangen.'}
					</p>
				</div>
			)}
		</div>
	);
}
