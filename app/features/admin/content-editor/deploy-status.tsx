'use client';

import {useEffect, useState} from 'react';
import {CheckCircle2, Loader2, AlertTriangle, CircleHelp} from 'lucide-react';
import {deployLabels} from '@lib/content-store/entry-types';

type State = keyof typeof deployLabels;

const pollInterval = 15_000;
const giveUpAfter = 15 * 60_000;

export function DeployStatus({initial, commit}: Readonly<{initial: State; commit?: string}>) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    if (state !== 'bezig') {
      return;
    }

    const startedAt = Date.now();
    const query = commit && /^[0-9a-f]{40}$/.test(commit) ? `?commit=${commit}` : '';
    const timer = setInterval(async () => {
      if (Date.now() - startedAt > giveUpAfter) {
        setState('onbekend');
        return;
      }

      try {
        const response = await fetch(`/api/admin/content/deploy-status${query}`, {cache: 'no-store'});
        if (response.ok) {
          const data = await response.json() as {state: State};
          setState(data.state);
        }
      } catch {
        // Keep the last known state and try again.
      }
    }, pollInterval);

    return () => {
      clearInterval(timer);
    };
  }, [state, commit]);

  const icon = {
    bezig: <Loader2 className='w-4 h-4 animate-spin text-gray-500' aria-hidden='true' />,
    klaar: <CheckCircle2 className='w-4 h-4 text-green-600' aria-hidden='true' />,
    mislukt: <AlertTriangle className='w-4 h-4 text-red-600' aria-hidden='true' />,
    onbekend: <CircleHelp className='w-4 h-4 text-gray-500' aria-hidden='true' />,
  }[state];

  return (
    <p role='status' className={`inline-flex items-center gap-2 text-sm ${state === 'mislukt' ? 'text-red-600' : 'text-gray-600'}`}>
      {icon}
      {deployLabels[state]}
    </p>
  );
}
