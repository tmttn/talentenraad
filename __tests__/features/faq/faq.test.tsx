import {fireEvent, render, screen} from '@testing-library/react';
import {Faq, FaqInfo} from '../../../app/features/faq/faq';
import {makeFaq} from '../../fixtures/content';

const items = [
  makeFaq({vraag: 'Eerste vraag?', slug: 'eerste', html: '<p>Eerste antwoord</p>'}),
  makeFaq({vraag: 'Tweede vraag?', slug: 'tweede', html: '<p>Tweede <strong>antwoord</strong></p>'}),
  makeFaq({vraag: 'Derde vraag?', slug: 'derde', html: '<p>Derde antwoord</p>'}),
];

describe('Faq', () => {
  it('renders all questions collapsed', () => {
    render(<Faq items={items} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map(button => button.textContent)).toEqual(['Eerste vraag?', 'Tweede vraag?', 'Derde vraag?']);
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('expands and collapses an item, announcing the change', () => {
    render(<Faq items={items} />);
    const [first] = screen.getAllByRole('button');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Eerste vraag? geopend');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Eerste vraag? gesloten');
  });

  it('renders the answer html', () => {
    render(<Faq items={items} />);
    expect(screen.getByText('antwoord').tagName).toBe('STRONG');
  });

  it.each([
    ['ArrowDown', 0, 1],
    ['ArrowDown', 2, 0],
    ['ArrowUp', 1, 0],
    ['ArrowUp', 0, 2],
    ['Home', 2, 0],
    ['End', 0, 2],
  ])('%s from item %i focuses item %i', (key, from, to) => {
    render(<Faq items={items} />);
    const buttons = screen.getAllByRole('button');
    buttons[from].focus();
    fireEvent.keyDown(buttons[from], {key});
    expect(buttons[to]).toHaveFocus();
  });

  it('renders JSON-LD with plain-text answers', () => {
    const {container} = render(<Faq items={items} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.innerHTML ?? '{}') as {
      '@type': string;
      mainEntity: Array<{name: string; acceptedAnswer: {text: string}}>;
    };
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(3);
    expect(data.mainEntity[1].acceptedAnswer.text).toBe('Tweede antwoord');
  });

  it('links buttons and regions for accessibility', () => {
    render(<Faq items={items} />);
    const [first] = screen.getAllByRole('button');
    const region = document.querySelector(`#${first.getAttribute('aria-controls')}`);
    expect(region).toHaveAttribute('aria-labelledby', first.id);
  });

  it('shows the empty state for an empty list', () => {
    render(<Faq items={[]} />);
    expect(screen.getByText('Geen veelgestelde vragen gevonden')).toBeInTheDocument();
  });

  it('exports builder info', () => {
    expect(FaqInfo.name).toBe('FAQ');
  });
});
