import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it} from 'vitest';
import {FotoGalerij} from '@features/news/foto-galerij';

beforeAll(() => {
  // jsdom has no modal dialogs
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const fotos = [1, 2, 3].map(nummer => ({src: `/content/nieuws/x/foto-${nummer}.jpg`, width: 800, height: 600}));
const dialog = () => document.querySelector('dialog')!;

describe('FotoGalerij lightbox', () => {
  it('opens the photo on the page instead of following the link', async () => {
    const user = userEvent.setup();
    render(<FotoGalerij fotos={fotos} titel='Soep' />);

    await user.click(screen.getByRole('link', {name: 'Foto 2 bij Soep'}));

    expect(dialog()).toHaveAttribute('open');
    expect(dialog()).toHaveAttribute('aria-label', 'Foto 2 van 3');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Sluiten'})).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('goes round with the buttons and the arrow keys', async () => {
    const user = userEvent.setup();
    render(<FotoGalerij fotos={fotos} titel='Soep' />);
    await user.click(screen.getByRole('link', {name: 'Foto 3 bij Soep'}));

    await user.click(screen.getByRole('button', {name: 'Volgende foto'}));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.keyDown(dialog(), {key: 'ArrowLeft'});
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Vorige foto'}));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('follows a swipe', async () => {
    const user = userEvent.setup();
    render(<FotoGalerij fotos={fotos} titel='Soep' />);
    await user.click(screen.getByRole('link', {name: 'Foto 1 bij Soep'}));
    const stage = within(dialog()).getByRole('img', {hidden: true}).closest('div')!;

    fireEvent.pointerDown(stage, {clientX: 300});
    fireEvent.pointerUp(stage, {clientX: 100});
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    fireEvent.pointerDown(stage, {clientX: 100});
    fireEvent.pointerUp(stage, {clientX: 120});
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes with the close button and frees the page scroll', async () => {
    const user = userEvent.setup();
    render(<FotoGalerij fotos={fotos} titel='Soep' />);
    await user.click(screen.getByRole('link', {name: 'Foto 1 bij Soep'}));

    await user.click(screen.getByRole('button', {name: 'Sluiten'}));

    expect(dialog()).not.toHaveAttribute('open');
    expect(document.documentElement.style.overflow).toBe('');
    expect(screen.getByRole('link', {name: 'Foto 1 bij Soep'})).toHaveFocus();
  });

  it('leaves ctrl/cmd-click to the browser and has no arrows for one photo', async () => {
    const user = userEvent.setup();
    const {unmount} = render(<FotoGalerij fotos={fotos} titel='Soep' />);
    fireEvent.click(screen.getByRole('link', {name: 'Foto 1 bij Soep'}), {ctrlKey: true});
    expect(dialog()).not.toHaveAttribute('open');
    unmount();

    render(<FotoGalerij fotos={fotos.slice(0, 1)} titel='Soep' />);
    await user.click(screen.getByRole('link', {name: 'Foto 1 bij Soep'}));
    expect(screen.queryByRole('button', {name: 'Volgende foto'})).not.toBeInTheDocument();
  });
});
