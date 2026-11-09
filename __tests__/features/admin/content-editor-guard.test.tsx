import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {UnrecognizedActionError} from 'next/dist/client/components/unrecognized-action-error';

// The real helpers: the global mock in vitest.setup.tsx has no unstable_rethrow.
vi.mock('next/navigation', async importOriginal => importOriginal());

vi.mock('../../../app/(admin)/admin/(protected)/content/actions', () => ({
  saveEntry: vi.fn(),
  deleteEntry: vi.fn(),
  saveAnnouncement: vi.fn(),
}));

const {redirect} = await import('next/navigation');
const {guardAction, unreachableMessage, updatedMessage} = await import('@features/admin/content-editor/guard-action');
const {EntryForm} = await import('@features/admin/content-editor/entry-form');
const {DeleteEntry} = await import('@features/admin/content-editor/delete-entry');
const {AnnouncementForm} = await import('@features/admin/content-editor/announcement-form');

type State = {message?: string; errors?: Record<string, string>};

// What the browser sees when Caddy answers 502 while the app restarts during a deploy.
const badGateway = () => new Error('An unexpected response was received from the server.');

describe('guardAction', () => {
  it('passes the result of the action through', async () => {
    await expect(guardAction(async () => ({errors: {titel: 'Fout'}}))).resolves.toEqual({errors: {titel: 'Fout'}});
  });

  it('turns a failed request into a message that the edits are still there', async () => {
    await expect(guardAction(async () => {
      throw badGateway();
    })).resolves.toEqual({message: unreachableMessage});
    await expect(guardAction(async () => {
      throw new TypeError('Failed to fetch');
    })).resolves.toEqual({message: unreachableMessage});
  });

  it('asks to reload when the server no longer knows the action (page older than the deploy)', async () => {
    await expect(guardAction(async () => {
      throw new UnrecognizedActionError('Server Action "60c0" was not found on the server.');
    })).resolves.toEqual({message: updatedMessage});
  });

  it('lets the redirect after a successful save through', async () => {
    let redirectError: unknown;
    try {
      redirect('/admin/content/team?opgeslagen=1');
    } catch (error) {
      redirectError = error;
    }

    await expect(guardAction(async () => {
      throw redirectError;
    })).rejects.toBe(redirectError);
  });
});

describe('editor forms when the server is unreachable', () => {
  it('EntryForm keeps the typed values and shows the message', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => {
      throw badGateway();
    });
    render(<EntryForm type='faq' mode='create' action={action} />);

    await user.type(screen.getByLabelText(/Vraag/), 'Wanneer is het schoolfeest?');
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByRole('alert')).toHaveTextContent(unreachableMessage);
    expect(screen.getByLabelText(/Vraag/)).toHaveValue('Wanneer is het schoolfeest?');
    expect(screen.getByRole('button', {name: 'Opslaan'})).toBeEnabled();
  });

  it('DeleteEntry shows the message', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => {
      throw badGateway();
    });
    render(<DeleteEntry type='nieuws' slug='oud' title='Oud nieuws' indexSha='si' imageSha='' action={action} />);

    await user.click(screen.getByRole('button', {name: 'Verwijderen'}));
    await user.click(screen.getByRole('button', {name: 'Ja, verwijderen'}));

    expect(await screen.findByRole('alert')).toHaveTextContent(unreachableMessage);
  });

  it('AnnouncementForm shows the message', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => {
      throw new UnrecognizedActionError('not found');
    });
    render(<AnnouncementForm initial={{actief: true, tekst: 'Geen training', type: 'info', link: '', linkTekst: ''}} sha='s' action={action} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByRole('alert')).toHaveTextContent(updatedMessage);
  });
});
