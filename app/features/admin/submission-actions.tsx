'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

type SubmissionActionsProperties = {
  submissionId: string;
};

export function SubmissionActions({submissionId}: Readonly<SubmissionActionsProperties>) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'archive' | 'delete') => {
    const confirmMessage = action === 'delete'
      ? 'Weet je zeker dat je dit bericht wilt verwijderen?'
      : 'Weet je zeker dat je dit bericht wilt archiveren?';

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ids: [submissionId], action}),
      });

      if (response.ok) {
        router.push('/admin/submissions');
        router.refresh();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='flex gap-2'>
      <button
        type='button'
        disabled={isProcessing}
        onClick={() => {
          void handleAction('archive');
        }}
        className='px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-button transition-colors disabled:opacity-50'
      >
        Archiveren
      </button>
      <button
        type='button'
        disabled={isProcessing}
        onClick={() => {
          void handleAction('delete');
        }}
        className='px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-button transition-colors disabled:opacity-50'
      >
        Verwijderen
      </button>
    </div>
  );
}
