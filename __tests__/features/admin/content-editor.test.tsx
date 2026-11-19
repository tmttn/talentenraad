import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

vi.mock('../../../app/(admin)/admin/(protected)/content/actions', () => ({
  saveEntry: vi.fn(),
  deleteEntry: vi.fn(),
  saveAnnouncement: vi.fn(),
}));

const {EntryForm} = await import('@features/admin/content-editor/entry-form');
const {DeleteEntry} = await import('@features/admin/content-editor/delete-entry');
const {AnnouncementForm} = await import('@features/admin/content-editor/announcement-form');
const {DeployStatus} = await import('@features/admin/content-editor/deploy-status');
const {parseAnnouncementForm, parseEntryForm} = await import('@lib/content-store/serialize');

type State = {message?: string; errors?: Record<string, string>};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => ({html: '<p>voorbeeld</p>'})}));
});

describe('EntryForm', () => {
  it('shows field errors from a failed parse and labels every field', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: State, data: FormData): Promise<State> => {
      const parsed = parseEntryForm('nieuws', data);
      return parsed.ok ? {} : {errors: parsed.errors};
    });
    render(<EntryForm type='nieuws' mode='create' action={action} />);

    expect(screen.getByLabelText(/Titel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Datum/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Samenvatting/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Inhoud/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByText('Vul een titel in.')).toBeInTheDocument();
    expect(screen.getByText('Kies een geldige datum.')).toBeInTheDocument();
  });

  it('shows a form-level message (conflict) above the form', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => ({message: 'Iemand anders heeft dit net aangepast. Herlaad de pagina.'}));
    render(<EntryForm type='faq' mode='create' action={action} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Herlaad de pagina');
  });

  it('posts the slug and hidden shas when editing and keeps the entered values', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => ({errors: {titel: 'Fout'}}));
    render(
      <EntryForm
        type='nieuws'
        mode='edit'
        slug='mijn-nieuws'
        imageUrl='/api/admin/content/image?type=nieuws&slug=mijn-nieuws'
        initial={{
          values: {titel: 'Mijn nieuws', datum: '2026-01-02', samenvatting: 'Kort'},
          body: 'Tekst',
          concept: false,
          aliases: ['oud-adres'],
          indexSha: 'sha-i',
          imageSha: 'sha-a',
        }}
        action={action}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
    const data = (action.mock.calls[0] as unknown as [State, FormData])[1];
    expect(data.get('_slug')).toBe('mijn-nieuws');
    expect(data.get('_indexSha')).toBe('sha-i');
    expect(data.get('_imageSha')).toBe('sha-a');
    expect(data.get('_hasImage')).toBe('1');
    expect(data.has('aliassen')).toBe(false);
    expect(data.get('titel')).toBe('Mijn nieuws');
    expect(await screen.findByDisplayValue('Mijn nieuws')).toBeInTheDocument();
    expect(screen.getByAltText('Huidige foto')).toBeInTheDocument();
  });

  it('renders a debounced preview from the server', async () => {
    render(<EntryForm type='faq' mode='create' initial={{values: {}, body: '**hoi**', concept: false, aliases: [], indexSha: '', imageSha: ''}} />);

    expect(await screen.findByText('voorbeeld')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/admin/content/preview', expect.objectContaining({method: 'POST'}));
  });
});

describe('EntryForm feedback and photo', () => {
  const photoFile = (size = 100) => {
    const file = new File(['x'.repeat(100)], 'foto.jpg', {type: 'image/jpeg'});
    if (size > 100) {
      Object.defineProperty(file, 'size', {value: size});
    }

    return file;
  };

  beforeEach(() => {
    vi.stubGlobal('URL', Object.assign(URL, {createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn()}));
  });

  it('focuses the first invalid field after a failed submit', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: State, data: FormData): Promise<State> => {
      const parsed = parseEntryForm('nieuws', data);
      return parsed.ok ? {} : {errors: parsed.errors};
    });
    render(<EntryForm type='nieuws' mode='create' action={action} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    await waitFor(() => {
      expect(screen.getByLabelText(/Titel/)).toHaveFocus();
    });
    expect(screen.getByLabelText(/Titel/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('focuses the form message when there is no invalid field', async () => {
    const user = userEvent.setup();
    render(<EntryForm type='faq' mode='create' action={async () => ({message: 'Mislukt'})} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveFocus();
    });
  });

  it('shows a general message for errors without a visible field', async () => {
    const user = userEvent.setup();
    render(<EntryForm type='faq' mode='create' action={async () => ({errors: {aliassen: 'Fout', concept: 'Fout'}})} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Er klopt iets niet aan dit item. Controleer de velden of vraag de beheerder om hulp.');
  });

  it('rejects a photo over 10 MB on the client and clears the input', async () => {
    const user = userEvent.setup({applyAccept: false});
    render(<EntryForm type='nieuws' mode='create' />);

    await user.upload(screen.getByLabelText(/Afbeelding/), photoFile(11 * 1024 * 1024));

    expect(await screen.findByText('De foto is groter dan 10 MB.')).toBeInTheDocument();
    expect((screen.getByLabelText(/Afbeelding/) as HTMLInputElement).files).toHaveLength(0);
    expect(screen.queryByAltText('Huidige foto')).not.toBeInTheDocument();
  });

  it('forgets the picked photo preview and asks to choose again after a failed submit', async () => {
    const user = userEvent.setup();
    render(<EntryForm type='nieuws' mode='create' action={async () => ({errors: {titel: 'Vul een titel in.'}})} />);

    await user.upload(screen.getByLabelText(/Afbeelding/), photoFile());
    expect(screen.getByAltText('Huidige foto')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByText('Kies de foto opnieuw.')).toBeInTheDocument();
    expect(screen.queryByAltText('Huidige foto')).not.toBeInTheDocument();
  });

  it('does not combine a new photo with removing the current one', async () => {
    const user = userEvent.setup();
    render(
      <EntryForm
        type='nieuws'
        mode='edit'
        slug='a'
        imageUrl='/x.jpg'
        initial={{values: {}, body: '', concept: false, aliases: [], indexSha: 'i', imageSha: 'm'}}
      />,
    );
    const input = () => screen.getByLabelText(/Afbeelding/) as HTMLInputElement;

    await user.upload(input(), photoFile());
    expect(screen.getByRole('switch', {name: 'Foto verwijderen'})).toBeDisabled();

    await user.upload(input(), []);
    // Picking nothing clears the preview again; now removing the current photo disables the file input.
    await user.click(screen.getByRole('switch', {name: 'Foto verwijderen'}));
    expect(input()).toBeDisabled();
    expect(input().files).toHaveLength(0);
  });
});

describe('EntryForm gallery', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', Object.assign(URL, {createObjectURL: vi.fn(() => `blob:${Math.random()}`), revokeObjectURL: vi.fn()}));
  });

  const initial = {
    values: {}, body: '', concept: false, aliases: [], indexSha: 'i', imageSha: '',
    fotos: [{file: 'foto-1.jpg', sha: 's1'}, {file: 'foto-4.jpg', sha: 's4'}],
  };

  it('shows the current photos and posts which ones to keep', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: State, _data: FormData): Promise<State> => ({message: 'stop'}));
    render(<EntryForm type='nieuws' mode='edit' slug='soep' initial={initial} action={action} />);

    expect(screen.getByAltText('Foto 1')).toHaveAttribute('src', '/api/admin/content/image?type=nieuws&slug=soep&file=foto-1.jpg&v=s1');
    await user.click(screen.getAllByRole('checkbox', {name: 'Verwijderen'})[0]);
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
    const data = action.mock.calls[0][1];
    expect(data.get('fotosBehouden')).toBe('foto-4.jpg');
    expect(JSON.parse(String(data.get('_fotos')))).toEqual(initial.fotos);
  });

  it('previews several new photos at once and asks for them again after a failed save', async () => {
    const user = userEvent.setup();
    render(<EntryForm type='nieuws' mode='create' action={async () => ({errors: {titel: 'Vul een titel in.'}})} />);
    const files = ['a.jpg', 'b.jpg'].map(name => new File(['x'], name, {type: 'image/jpeg'}));

    await user.upload(screen.getByLabelText(/Foto's/, {selector: 'input'}), files);

    expect(await screen.findByAltText('Nieuwe foto 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));
    expect(await screen.findByText("Kies de nieuwe foto's opnieuw.")).toBeInTheDocument();
  });

  it('refuses more photos than there is room for', async () => {
    const user = userEvent.setup();
    const vol = {...initial, fotos: Array.from({length: 11}, (_, index) => ({file: `foto-${index + 1}.jpg`, sha: `s${index}`}))};
    render(<EntryForm type='nieuws' mode='edit' slug='soep' initial={vol} />);
    const files = ['a.jpg', 'b.jpg'].map(name => new File(['x'], name, {type: 'image/jpeg'}));

    await user.upload(screen.getByLabelText(/Foto's/, {selector: 'input'}), files);

    expect(await screen.findByText("Er kunnen nog 1 foto's bij (hoogstens 12).")).toBeInTheDocument();
    expect(screen.getAllByAltText(/Nieuwe foto/)).toHaveLength(1);
  });

  it('rejects a video over 25 MB on the client and can remove the current one', async () => {
    const user = userEvent.setup();
    render(<EntryForm type='nieuws' mode='edit' slug='soep' initial={{...initial, fotos: [], videoSha: 'sv'}} />);
    const input = screen.getByLabelText(/Filmpje/, {selector: 'input[type="file"]'}) as HTMLInputElement;
    const big = new File(['x'], 'groot.mp4', {type: 'video/mp4'});
    Object.defineProperty(big, 'size', {value: 26 * 1024 * 1024});

    expect(screen.getByLabelText('Huidig filmpje')).toHaveAttribute('src', '/api/admin/content/image?type=nieuws&slug=soep&file=video.mp4&v=sv');
    await user.upload(input, big);
    expect(await screen.findByText(/groter dan 25 MB/)).toBeInTheDocument();
    expect(input.files).toHaveLength(0);

    await user.click(screen.getByRole('switch', {name: 'Filmpje verwijderen'}));
    expect(input).toBeDisabled();
    expect(screen.queryByLabelText('Huidig filmpje')).not.toBeInTheDocument();
  });

  it('uploads a picked video on its own and posts only its id', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ok: true, json: async () => ({id: 'b'.repeat(32)})});
    vi.stubGlobal('fetch', fetchMock);
    const action = vi.fn(async (_state: State, _data: FormData): Promise<State> => ({message: 'stop'}));
    render(<EntryForm type='nieuws' mode='create' action={action} />);

    await user.upload(screen.getByLabelText(/Filmpje/, {selector: 'input[type="file"]'}), new File(['film'], 'film.mp4', {type: 'video/mp4'}));
    expect(await screen.findByLabelText('Huidig filmpje')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/content/video', expect.objectContaining({method: 'POST'}));

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));
    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
    const data = action.mock.calls[0][1];
    expect(data.get('videoUpload')).toBe('b'.repeat(32));
    expect(data.has('video')).toBe(false);
  });

  it('shows the upload error and keeps no id', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: false, json: async () => ({error: 'Dit bestand is geen mp4-filmpje.'})}));
    render(<EntryForm type='nieuws' mode='create' />);

    await user.upload(screen.getByLabelText(/Filmpje/, {selector: 'input[type="file"]'}), new File(['x'], 'x.mp4', {type: 'video/mp4'}));

    expect(await screen.findByText('Dit bestand is geen mp4-filmpje.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Huidig filmpje')).not.toBeInTheDocument();
  });

  it('has no gallery for activities', () => {
    render(<EntryForm type='activiteiten' mode='create' />);
    expect(screen.queryByLabelText(/Foto's/, {selector: 'input'})).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Filmpje/, {selector: 'input[type="file"]'})).not.toBeInTheDocument();
  });
});

describe('DeleteEntry', () => {
  it('asks for confirmation before it can submit and can be cancelled', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<State> => ({}));
    render(<DeleteEntry type='nieuws' slug='oud' title='Oud nieuws' indexSha='si' imageSha='sm' action={action} />);

    expect(screen.queryByRole('button', {name: 'Ja, verwijderen'})).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Verwijderen'}));

    expect(screen.getByText(/Weet je het zeker\? Dit verwijdert/)).toHaveTextContent('Oud nieuws');
    expect(screen.getByText(/Weet je het zeker\? Dit verwijdert/)).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: 'Annuleren'}));
    expect(screen.queryByRole('button', {name: 'Ja, verwijderen'})).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Verwijderen'}));
    await user.click(screen.getByRole('button', {name: 'Ja, verwijderen'}));

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
    const data = (action.mock.calls[0] as unknown as [State, FormData])[1];
    expect(data.get('_slug')).toBe('oud');
    expect(data.get('_indexSha')).toBe('si');
    expect(data.get('_imageSha')).toBe('sm');
  });
});

describe('AnnouncementForm', () => {
  it('round-trips the values through the announcement parser', async () => {
    const user = userEvent.setup();
    let received: FormData | undefined;
    const action = vi.fn(async (_state: State, data: FormData): Promise<State> => {
      received = data;
      return {};
    });
    render(<AnnouncementForm initial={{actief: true, tekst: 'Oud', type: 'info', link: '', linkTekst: ''}} sha='site-sha' action={action} />);

    await user.clear(screen.getByLabelText(/^Tekst\*?$/));
    await user.type(screen.getByLabelText(/^Tekst\*?$/), 'Geen training');
    await user.selectOptions(screen.getByLabelText('Soort'), 'waarschuwing');
    await user.type(screen.getByLabelText('Link'), 'www.example.com');
    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    await waitFor(() => {
      expect(received).toBeDefined();
    });
    expect(received?.get('_sha')).toBe('site-sha');
    const parsed = parseAnnouncementForm(received as FormData);
    expect(parsed).toEqual({
      ok: true,
      aankondiging: {
        actief: true, tekst: 'Geen training', type: 'waarschuwing', link: 'https://www.example.com',
      },
    });
  });

  it('shows the field error for an active announcement without text', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_state: State, data: FormData): Promise<State> => {
      const parsed = parseAnnouncementForm(data);
      return parsed.ok ? {} : {errors: parsed.errors};
    });
    render(<AnnouncementForm initial={{actief: true, tekst: '', type: 'info', link: '', linkTekst: ''}} sha='s' action={action} />);

    await user.click(screen.getByRole('button', {name: 'Opslaan'}));

    expect(await screen.findByText('Vul een tekst in.')).toBeInTheDocument();
  });
});

describe('DeployStatus', () => {
  it('polls while bezig and stops when klaar', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({ok: true, json: async () => ({state: 'klaar'})});
    vi.stubGlobal('fetch', fetchMock);
    render(<DeployStatus initial='bezig' />);

    expect(screen.getByRole('status')).toHaveTextContent('Bezig met online zetten…');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/content/deploy-status', expect.anything());
    expect(screen.getByRole('status')).toHaveTextContent('Online');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('asks for the status of its own commit and gives up after 15 minutes', async () => {
    vi.useFakeTimers();
    const commit = 'a'.repeat(40);
    const fetchMock = vi.fn().mockResolvedValue({ok: true, json: async () => ({state: 'bezig'})});
    vi.stubGlobal('fetch', fetchMock);
    render(<DeployStatus initial='bezig' commit={commit} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(fetchMock).toHaveBeenCalledWith(`/api/admin/content/deploy-status?commit=${commit}`, expect.anything());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16 * 60_000);
    });
    expect(screen.getByRole('status')).toHaveTextContent('onbekend');
    vi.useRealTimers();
  });

  it('shows the failure text', () => {
    render(<DeployStatus initial='mislukt' />);

    expect(screen.getByRole('status')).toHaveTextContent('Online zetten mislukt');
  });
});
