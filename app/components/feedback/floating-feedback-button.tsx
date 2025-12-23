'use client';

import {useState, useCallback} from 'react';
import {MessageCircle, Send, X} from 'lucide-react';
import {toast} from 'sonner';
import {Modal} from '@components/ui/interactive/Modal';
import {StarRating} from './star-rating';
import {useRecaptcha} from '@features/contact/use-recaptcha';

type FeedbackFormData = {
	rating: number;
	comment: string;
	email: string;
};

type FormErrors = {
	rating?: string;
	comment?: string;
	email?: string;
};

const initialFormData: FeedbackFormData = {
	rating: 0,
	comment: '',
	email: '',
};

export function FloatingFeedbackButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
	const [errors, setErrors] = useState<FormErrors>({});

	const {isReady: isRecaptchaReady, executeRecaptcha} = useRecaptcha();

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (formData.rating === 0) {
			newErrors.rating = 'Selecteer een beoordeling';
		}

		if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Ongeldig e-mailadres';
		}

		if (formData.comment.length > 2000) {
			newErrors.comment = 'Opmerking mag maximaal 2000 tekens bevatten';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Execute reCAPTCHA
			const recaptchaToken = await executeRecaptcha('feedback');

			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					rating: formData.rating,
					comment: formData.comment.trim() || undefined,
					email: formData.email.trim() || undefined,
					pageUrl: window.location.pathname,
					pageTitle: document.title,
					recaptchaToken,
				}),
			});

			const data = await response.json() as {success: boolean; message: string};

			if (data.success) {
				toast.success(data.message);
				setFormData(initialFormData);
				setErrors({});
				setIsOpen(false);
			} else {
				toast.error(data.message);
			}
		} catch {
			toast.error('Er is een fout opgetreden. Probeer het later opnieuw.');
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, executeRecaptcha]);

	const handleClose = () => {
		if (!isSubmitting) {
			setIsOpen(false);
			setErrors({});
		}
	};

	return (
		<>
			{/* Floating Action Button - positioned above reCAPTCHA badge */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="
					fixed bottom-24 right-6 z-40
					w-14 h-14 rounded-full
					bg-primary text-white
					shadow-floating hover:shadow-high
					flex items-center justify-center
					transition-all duration-200
					hover:scale-105 active:scale-95
					focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
				"
				aria-label="Geef feedback"
			>
				<MessageCircle className="w-6 h-6" />
			</button>

			{/* Feedback Modal */}
			<Modal
				open={isOpen}
				onClose={handleClose}
				title="Geef ons je feedback"
				size="sm"
			>
				<div className="space-y-6">
					{/* Rating */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Hoe vind je deze website? <span className="text-red-500">*</span>
						</label>
						<StarRating
							value={formData.rating}
							onChange={rating => {
								setFormData(prev => ({...prev, rating}));
								if (errors.rating) {
									setErrors(prev => ({...prev, rating: undefined}));
								}
							}}
							disabled={isSubmitting}
						/>
						{errors.rating && (
							<p className="mt-1 text-sm text-red-600">{errors.rating}</p>
						)}
					</div>

					{/* Comment */}
					<div>
						<label
							htmlFor="feedback-comment"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Opmerking <span className="text-gray-400">(optioneel)</span>
						</label>
						<textarea
							id="feedback-comment"
							value={formData.comment}
							onChange={e => setFormData(prev => ({...prev, comment: e.target.value}))}
							disabled={isSubmitting}
							rows={4}
							maxLength={2000}
							placeholder="Vertel ons wat je denkt..."
							className="
								w-full px-3 py-2 rounded-input border border-gray-300
								focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
								disabled:opacity-50 disabled:cursor-not-allowed
								resize-none
							"
						/>
						<div className="mt-1 flex justify-between">
							{errors.comment ? (
								<p className="text-sm text-red-600">{errors.comment}</p>
							) : (
								<span />
							)}
							<span className="text-xs text-gray-400">
								{formData.comment.length}/2000
							</span>
						</div>
					</div>

					{/* Email */}
					<div>
						<label
							htmlFor="feedback-email"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							E-mailadres <span className="text-gray-400">(optioneel)</span>
						</label>
						<input
							type="email"
							id="feedback-email"
							value={formData.email}
							onChange={e => {
								setFormData(prev => ({...prev, email: e.target.value}));
								if (errors.email) {
									setErrors(prev => ({...prev, email: undefined}));
								}
							}}
							disabled={isSubmitting}
							placeholder="je@email.com"
							className="
								w-full px-3 py-2 rounded-input border border-gray-300
								focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
								disabled:opacity-50 disabled:cursor-not-allowed
							"
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email}</p>
						)}
						<p className="mt-1 text-xs text-gray-500">
							Alleen als je wilt dat we reageren op je feedback
						</p>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={handleClose}
							disabled={isSubmitting}
							className="
								flex-1 px-4 py-2.5 rounded-button
								bg-gray-100 text-gray-700
								font-medium transition-colors duration-150
								hover:bg-gray-200
								disabled:opacity-50 disabled:cursor-not-allowed
								flex items-center justify-center gap-2
							"
						>
							<X className="w-4 h-4" />
							Annuleren
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting || !isRecaptchaReady || formData.rating === 0}
							className="
								flex-1 px-4 py-2.5 rounded-button
								bg-primary text-white
								font-medium transition-colors duration-150
								hover:bg-primary-hover
								disabled:opacity-50 disabled:cursor-not-allowed
								flex items-center justify-center gap-2
							"
						>
							<Send className="w-4 h-4" />
							{isSubmitting ? 'Verzenden...' : 'Verstuur'}
						</button>
					</div>

					{/* reCAPTCHA notice */}
					<p className="text-xs text-gray-400 text-center">
						Beschermd door reCAPTCHA
					</p>
				</div>
			</Modal>
		</>
	);
}
