import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const requireEditorSession = vi.fn();
const isEditingConfigured = vi.fn();
const listDir = vi.fn();
const readFile = vi.fn();
const latestDeployStatus = vi.fn();
const notFound = vi.fn(() => {
  throw new Error('NOT_FOUND');
});

vi.mock('@lib/auth/require-admin', () => ({requireEditorSession}));
vi.mock('@lib/content-store/github', () => ({
  isEditingConfigured, listDir, readFile, latestDeployStatus,
}));
vi.mock('next/navigation', () => ({notFound, usePathname: () => '/admin', useRouter: () => ({})}));
vi.mock('../../../app/(admin)/admin/(protected)/content/actions', () => ({
  saveEntry: vi.fn(), deleteEntry: vi.fn(), saveAnnouncement: vi.fn(),
}));

const overview = (await import('../../../app/(admin)/admin/(protected)/content/page')).default;
const list = (await import('../../../app/(admin)/admin/(protected)/content/[type]/page')).default;
const create = (await import('../../../app/(admin)/admin/(protected)/content/[type]/nieuw/page')).default;
const edit = (await import('../../../app/(admin)/admin/(protected)/content/[type]/[slug]/page')).default;
const announcement = (await import('../../../app/(admin)/admin/(protected)/content/aankondiging/page')).default;

const notConfigured = 'Bewerken is nog niet ingesteld. Vraag de beheerder om de GitHub-koppeling in te stellen.';

beforeEach(() => {
  requireEditorSession.mockReset().mockResolvedValue({user: {role: 'redacteur'}});
  isEditingConfigured.mockReset().mockReturnValue(true);
  listDir.mockReset().mockResolvedValue([]);
  readFile.mockReset();
  latestDeployStatus.mockReset().mockResolvedValue({state: 'klaar'});
});

describe('content pages when editing is not configured', () => {
  beforeEach(() => {
    isEditingConfigured.mockReturnValue(false);
  });

  it('overview shows the message and no edit links', async () => {
    render(await overview({searchParams: Promise.resolve({})}));

    expect(screen.getByText(notConfigured)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('list shows the message without an add button', async () => {
    render(await list({params: Promise.resolve({type: 'nieuws'}), searchParams: Promise.resolve({})}));

    expect(screen.getByText(notConfigured)).toBeInTheDocument();
    expect(screen.queryByText('Nieuwsbericht toevoegen')).not.toBeInTheDocument();
    expect(listDir).not.toHaveBeenCalled();
  });

  it('new and edit pages show the message and no form', async () => {
    render(await create({params: Promise.resolve({type: 'nieuws'})}));
    expect(screen.getByText(notConfigured)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Opslaan'})).not.toBeInTheDocument();

    render(await edit({params: Promise.resolve({type: 'nieuws', slug: 'a'})}));
    expect(screen.getAllByText(notConfigured)).toHaveLength(2);
    expect(screen.queryByRole('button', {name: 'Opslaan'})).not.toBeInTheDocument();
  });

  it('announcement page shows the message and no form', async () => {
    render(await announcement());

    expect(screen.getByText(notConfigured)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Opslaan'})).not.toBeInTheDocument();
  });
});

describe('content pages when configured', () => {
  it('overview has a card per type and the announcement', async () => {
    listDir.mockResolvedValue([{name: 'a', path: 'content/x/a', type: 'dir', sha: 's'}]);
    render(await overview({searchParams: Promise.resolve({})}));

    for (const label of ['Activiteiten', 'Nieuws', 'Team', 'Veelgestelde vragen', 'Aankondiging']) {
      expect(screen.getByRole('heading', {name: label})).toBeInTheDocument();
    }
  });

  it('list shows items with Bewerken and sorted by date, newest first', async () => {
    listDir.mockResolvedValue([
      {name: 'oud', path: 'content/nieuws/oud', type: 'dir', sha: 's'},
      {name: 'nieuw-item', path: 'content/nieuws/nieuw-item', type: 'dir', sha: 's'},
    ]);
    readFile.mockImplementation(async (path: string) => ({
      sha: 'x',
      text: path.includes('/oud/')
        ? '---\ntitel: Oud bericht\ndatum: 2024-01-01\nsamenvatting: x\n---\n'
        : '---\ntitel: Nieuw bericht\ndatum: 2026-05-01\nsamenvatting: x\n---\n',
    }));

    render(await list({params: Promise.resolve({type: 'nieuws'}), searchParams: Promise.resolve({opgeslagen: '1'})}));

    const titles = screen.getAllByText(/bericht$/).map(node => node.textContent);
    expect(titles).toEqual(['Nieuw bericht', 'Oud bericht']);
    expect(screen.getAllByRole('link', {name: 'Bewerken'})).toHaveLength(2);
    expect(screen.getByRole('link', {name: /Nieuwsbericht toevoegen/})).toHaveAttribute('href', '/admin/content/nieuws/nieuw');
    expect(screen.getByText('Opgeslagen. Je wijziging staat over ongeveer 3 minuten online.')).toBeInTheDocument();
    expect(screen.getByText('1 mei 2026')).toBeInTheDocument();
  });

  it('unknown type is a 404', async () => {
    await expect(list({params: Promise.resolve({type: 'geheim'}), searchParams: Promise.resolve({})})).rejects.toThrow('NOT_FOUND');
  });

  it('edit page loads the item and shows the delete section', async () => {
    readFile.mockResolvedValue({sha: 'idx', text: '---\nvraag: Waar?\nvolgorde: 1\n---\n\nHier.\n'});
    render(await edit({params: Promise.resolve({type: 'faq', slug: 'waar'})}));

    expect(screen.getByLabelText(/Vraag/)).toHaveValue('Waar?');
    expect(screen.getByDisplayValue('Hier.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Verwijderen'})).toBeInTheDocument();
  });

  it('edit page is a 404 for a missing item or a bad slug', async () => {
    readFile.mockResolvedValue(undefined);

    await expect(edit({params: Promise.resolve({type: 'faq', slug: 'weg'})})).rejects.toThrow('NOT_FOUND');
    await expect(edit({params: Promise.resolve({type: 'faq', slug: '../x'})})).rejects.toThrow('NOT_FOUND');
  });

  it('announcement page reads site.yaml', async () => {
    readFile.mockResolvedValue({sha: 's', text: 'aankondiging:\n  actief: true\n  tekst: Hallo\n  type: belangrijk\n'});
    render(await announcement());

    expect(screen.getByDisplayValue('Hallo')).toBeInTheDocument();
  });
});
