import {render, screen} from '@testing-library/react';
import {Typography} from '../../../app/components/ui/typography';

describe('Typography', () => {
	it('renders text content', () => {
		render(<Typography text='Hello World' />);
		expect(screen.getByText('Hello World')).toBeInTheDocument();
	});

	describe('variants', () => {
		it('renders h1 variant as h1 element', () => {
			render(<Typography text='Heading 1' variant='h1' />);
			const heading = screen.getByRole('heading', {level: 1});
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveClass('text-4xl');
		});

		it('renders h2 variant as h2 element', () => {
			render(<Typography text='Heading 2' variant='h2' />);
			const heading = screen.getByRole('heading', {level: 2});
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveClass('text-3xl');
		});

		it('renders h3 variant as h3 element', () => {
			render(<Typography text='Heading 3' variant='h3' />);
			const heading = screen.getByRole('heading', {level: 3});
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveClass('text-2xl');
		});

		it('renders h4 variant as h4 element', () => {
			render(<Typography text='Heading 4' variant='h4' />);
			const heading = screen.getByRole('heading', {level: 4});
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveClass('text-xl');
		});

		it('renders lead variant as p element', () => {
			const {container} = render(<Typography text='Lead text' variant='lead' />);
			const element = container.querySelector('p');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('text-lg');
		});

		it('renders body variant as p element by default', () => {
			const {container} = render(<Typography text='Body text' />);
			const element = container.querySelector('p');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('text-base');
		});

		it('renders small variant as p element', () => {
			const {container} = render(<Typography text='Small text' variant='small' />);
			const element = container.querySelector('p');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('text-sm');
		});

		it('renders caption variant as span element', () => {
			const {container} = render(<Typography text='Caption text' variant='caption' />);
			const element = container.querySelector('span');
			expect(element).toBeInTheDocument();
			expect(element).toHaveClass('text-xs', 'uppercase', 'tracking-wide');
		});
	});

	describe('colors', () => {
		it('applies default color', () => {
			const {container} = render(<Typography text='Default' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-gray-900');
		});

		it('applies muted color', () => {
			const {container} = render(<Typography text='Muted' color='muted' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-gray-600');
		});

		it('applies primary color', () => {
			const {container} = render(<Typography text='Primary' color='primary' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-primary');
		});

		it('applies secondary color', () => {
			const {container} = render(<Typography text='Secondary' color='secondary' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-secondary');
		});

		it('applies accent color', () => {
			const {container} = render(<Typography text='Accent' color='accent' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-accent');
		});

		it('applies white color', () => {
			const {container} = render(<Typography text='White' color='white' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-white');
		});
	});

	describe('alignment', () => {
		it('applies left alignment by default', () => {
			const {container} = render(<Typography text='Left' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-left');
		});

		it('applies center alignment', () => {
			const {container} = render(<Typography text='Center' align='center' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-center');
		});

		it('applies right alignment', () => {
			const {container} = render(<Typography text='Right' align='right' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('text-right');
		});
	});

	describe('weight', () => {
		it('does not apply weight class when not specified', () => {
			const {container} = render(<Typography text='Normal' />);
			const element = container.querySelector('p');
			expect(element).not.toHaveClass('font-normal');
			expect(element).not.toHaveClass('font-medium');
		});

		it('applies normal weight when specified', () => {
			const {container} = render(<Typography text='Normal' weight='normal' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('font-normal');
		});

		it('applies medium weight', () => {
			const {container} = render(<Typography text='Medium' weight='medium' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('font-medium');
		});

		it('applies semibold weight', () => {
			const {container} = render(<Typography text='Semibold' weight='semibold' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('font-semibold');
		});

		it('applies bold weight', () => {
			const {container} = render(<Typography text='Bold' weight='bold' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('font-bold');
		});
	});

	describe('whitespace handling', () => {
		it('preserves line breaks with whitespace-pre-line', () => {
			const {container} = render(<Typography text='Line 1\nLine 2' />);
			const element = container.querySelector('p');
			expect(element).toHaveClass('whitespace-pre-line');
		});
	});

	describe('combined props', () => {
		it('combines multiple props correctly', () => {
			render(
				<Typography
					text='Combined'
					variant='h2'
					color='primary'
					align='center'
					weight='bold'
				/>,
			);
			const heading = screen.getByRole('heading', {level: 2});
			expect(heading).toHaveClass('text-3xl', 'text-primary', 'text-center', 'font-bold');
		});
	});
});
