import Link from 'next/link';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import {leavesPage, unsavedMessage, useUnsavedWarning} from '@features/admin/content-editor/use-unsaved-warning';

function Form() {
  const {dirty, formHandlers} = useUnsavedWarning();
  return (
    <>
      <form {...formHandlers}>
        <label htmlFor='titel'>Titel</label>
        <input id='titel' />
        <button type='button' role='switch' aria-checked='false'>Concept</button>
      </form>
      <p>{dirty ? 'gewijzigd' : 'ongewijzigd'}</p>
      <Link href='/elders'>Terug</Link>
      <a href='/' target='_blank' rel='noreferrer'>Website</a>
    </>
  );
}

const click = (element: Element) => {
  const event = new MouseEvent('click', {bubbles: true, cancelable: true, button: 0});
  element.dispatchEvent(event);
  return event;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useUnsavedWarning', () => {
  it('does not ask before anything changed', () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    render(<Form />);
    expect(click(screen.getByRole('link', {name: 'Terug'})).defaultPrevented).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before following a link after an edit, and stays when declined', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    render(<Form />);
    await user.type(screen.getByLabelText('Titel'), 'x');
    expect(screen.getByText('gewijzigd')).toBeInTheDocument();

    expect(click(screen.getByRole('link', {name: 'Terug'})).defaultPrevented).toBe(true);
    expect(confirm).toHaveBeenCalledWith(unsavedMessage);

    // A new tab keeps the form open, so no question
    confirm.mockClear();
    expect(click(screen.getByRole('link', {name: 'Website'})).defaultPrevented).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('lets the link through when confirmed', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn(() => true));
    render(<Form />);
    await user.type(screen.getByLabelText('Titel'), 'x');
    expect(click(screen.getByRole('link', {name: 'Terug'})).defaultPrevented).toBe(false);
  });

  it('counts a switch as a change and warns when closing the tab', async () => {
    const user = userEvent.setup();
    render(<Form />);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByText('gewijzigd')).toBeInTheDocument();
    const event = new Event('beforeunload', {cancelable: true});
    globalThis.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('leavesPage', () => {
  const event = (target: Element, init: MouseEventInit = {}) => {
    const value = new MouseEvent('click', {button: 0, ...init});
    Object.defineProperty(value, 'target', {value: target});
    return value;
  };

  const link = (attributes: Record<string, string>) => {
    const anchor = document.createElement('a');
    for (const [key, value] of Object.entries(attributes)) {
      anchor.setAttribute(key, value);
    }

    return anchor;
  };

  it('only counts a plain click on a link in this tab', () => {
    expect(leavesPage(event(link({href: '/admin'})))).toBe(true);
    expect(leavesPage(event(link({href: '/admin'}), {metaKey: true}))).toBe(false);
    expect(leavesPage(event(link({href: '/admin'}), {button: 1}))).toBe(false);
    expect(leavesPage(event(link({href: '#veld'})))).toBe(false);
    expect(leavesPage(event(link({href: '/export', download: ''})))).toBe(false);
    expect(leavesPage(event(document.createElement('button')))).toBe(false);
  });
});
