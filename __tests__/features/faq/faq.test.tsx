import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import {FaqInfo} from '../../../app/features/faq/faq';

const FAQ = FaqInfo.component;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FAQ', () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it('shows loading state initially', () => {
		mockFetch.mockImplementation(() => new Promise(() => {}));
		const {container} = render(<FAQ />);
		const section = container.querySelector('section');
		expect(section).toHaveAttribute('aria-busy', 'true');
	});

	it('renders title and subtitle after loading', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: []}),
		});

		render(<FAQ title='FAQ Title' subtitle='FAQ subtitle' />);

		await waitFor(() => {
			expect(screen.getByRole('heading', {level: 2, name: 'FAQ Title'})).toBeInTheDocument();
		});
		expect(screen.getByText('FAQ subtitle')).toBeInTheDocument();
	});

	it('renders empty state when no FAQs', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: []}),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Nog geen vragen')).toBeInTheDocument();
		});
	});

	it('renders FAQ items', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Question 1?', antwoord: 'Answer 1'}},
				{id: '2', data: {vraag: 'Question 2?', antwoord: 'Answer 2'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Question 1?')).toBeInTheDocument();
		});
		expect(screen.getByText('Question 2?')).toBeInTheDocument();
	});

	it('expands and collapses FAQ items on click', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Question?', antwoord: 'The answer'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Question?')).toBeInTheDocument();
		});

		const button = screen.getByRole('button', {name: /question/i});
		expect(button).toHaveAttribute('aria-expanded', 'false');

		// Expand
		fireEvent.click(button);
		expect(button).toHaveAttribute('aria-expanded', 'true');

		// Collapse
		fireEvent.click(button);
		expect(button).toHaveAttribute('aria-expanded', 'false');
	});

	it('handles keyboard navigation - ArrowDown', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[0].focus();
		fireEvent.keyDown(buttons[0], {key: 'ArrowDown'});

		expect(document.activeElement).toBe(buttons[1]);
	});

	it('handles keyboard navigation - ArrowUp', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[1].focus();
		fireEvent.keyDown(buttons[1], {key: 'ArrowUp'});

		expect(document.activeElement).toBe(buttons[0]);
	});

	it('handles keyboard navigation - Home', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
				{id: '3', data: {vraag: 'Q3', antwoord: 'A3'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[2].focus();
		fireEvent.keyDown(buttons[2], {key: 'Home'});

		expect(document.activeElement).toBe(buttons[0]);
	});

	it('handles keyboard navigation - End', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
				{id: '3', data: {vraag: 'Q3', antwoord: 'A3'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[0].focus();
		fireEvent.keyDown(buttons[0], {key: 'End'});

		expect(document.activeElement).toBe(buttons[2]);
	});

	it('wraps around at boundaries - ArrowDown from last item', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[1].focus();
		fireEvent.keyDown(buttons[1], {key: 'ArrowDown'});

		expect(document.activeElement).toBe(buttons[0]);
	});

	it('wraps around at boundaries - ArrowUp from first item', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Q1', antwoord: 'A1'}},
				{id: '2', data: {vraag: 'Q2', antwoord: 'A2'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Q1')).toBeInTheDocument();
		});

		const buttons = screen.getAllByRole('button');
		buttons[0].focus();
		fireEvent.keyDown(buttons[0], {key: 'ArrowUp'});

		expect(document.activeElement).toBe(buttons[1]);
	});

	it('shows ask question section by default', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: []}),
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Staat jouw vraag er niet bij?')).toBeInTheDocument();
		});
		expect(screen.getByRole('link', {name: /stel je vraag/i})).toHaveAttribute('href', '/contact');
	});

	it('hides ask question section when showAskQuestion is false', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({results: []}),
		});

		render(<FAQ showAskQuestion={false} />);

		await waitFor(() => {
			expect(screen.getByText('Nog geen vragen')).toBeInTheDocument();
		});
		expect(screen.queryByText('Staat jouw vraag er niet bij?')).not.toBeInTheDocument();
	});

	it('renders JSON-LD structured data', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Question?', antwoord: 'Answer'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		const {container} = render(<FAQ />);

		await waitFor(() => {
			const script = container.querySelector('script[type="application/ld+json"]');
			expect(script).toBeInTheDocument();
			const data = JSON.parse(script?.textContent ?? '{}');
			expect(data['@type']).toBe('FAQPage');
		});
	});

	it('handles fetch error gracefully', async () => {
		mockFetch.mockRejectedValue(new Error('Fetch failed'));

		render(<FAQ />);

		await waitFor(() => {
			// Should show empty state on error
			expect(screen.getByText('Nog geen vragen')).toBeInTheDocument();
		});
	});

	it('handles non-ok response gracefully', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
		});

		render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Nog geen vragen')).toBeInTheDocument();
		});
	});

	it('has proper accessibility attributes', async () => {
		const mockFaqs = {
			results: [
				{id: '1', data: {vraag: 'Question?', antwoord: 'Answer'}},
			],
		};
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockFaqs),
		});

		const {container} = render(<FAQ />);

		await waitFor(() => {
			expect(screen.getByText('Question?')).toBeInTheDocument();
		});

		const accordion = container.querySelector('[role="region"]');
		expect(accordion).toHaveAttribute('aria-label', 'Veelgestelde vragen accordeon');

		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('aria-controls', 'faq-answer-0');
		expect(button).toHaveAttribute('id', 'faq-button-0');
	});
});

describe('FaqInfo', () => {
	it('exports correct component info', () => {
		expect(FaqInfo.name).toBe('FAQ');
		expect(FaqInfo.component).toBeDefined();
		expect(FaqInfo.inputs).toBeInstanceOf(Array);
	});
});
