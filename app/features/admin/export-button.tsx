'use client';

import {useState} from 'react';
import {Download} from 'lucide-react';
import {toast} from 'sonner';
import type {ContentType} from '@lib/data-export';

type ExportButtonProps = {
	contentType: ContentType;
	itemId: string;
	label?: string;
	variant?: 'primary' | 'secondary' | 'icon';
	className?: string;
};

export function ExportButton({
	contentType,
	itemId,
	label = 'Exporteren',
	variant = 'secondary',
	className = '',
}: ExportButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);

		try {
			const response = await fetch(
				`/api/admin/data/export?types=${contentType}&id=${itemId}`,
				{credentials: 'include'},
			);

			if (!response.ok) {
				throw new Error('Export mislukt');
			}

			// Get filename from Content-Disposition header
			const contentDisposition = response.headers.get('Content-Disposition');
			const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
			const filename = filenameMatch?.[1] ?? `export-${contentType}-${itemId}.json`;

			// Download the file
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.append(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);

			toast.success('Export succesvol gedownload');
		} catch {
			toast.error('Export mislukt');
		} finally {
			setIsExporting(false);
		}
	};

	const baseStyles = 'inline-flex items-center gap-2 font-medium rounded-button transition-colors disabled:opacity-50';

	const variantStyles = {
		primary: 'px-4 py-2.5 bg-primary text-white hover:bg-primary-hover',
		secondary: 'px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200',
		icon: 'p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100',
	};

	return (
		<button
			type='button'
			onClick={handleExport}
			disabled={isExporting}
			title={label}
			className={`${baseStyles} ${variantStyles[variant]} ${className}`}
		>
			<Download className={variant === 'icon' ? 'w-4 h-4' : 'w-4 h-4'} />
			{variant !== 'icon' && (
				<span>{isExporting ? 'Bezig...' : label}</span>
			)}
		</button>
	);
}
