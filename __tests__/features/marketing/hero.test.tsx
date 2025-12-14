import {render} from '@testing-library/react';
import {HeroInfo} from '../../../app/features/marketing/hero';

const Hero = HeroInfo.component;

describe('Hero', () => {
	describe('sizes', () => {
		it('applies medium size by default', () => {
			const {container} = render(<Hero />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-20', 'md:py-28');
		});

		it('applies compact size', () => {
			const {container} = render(<Hero size='compact' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-12', 'md:py-16');
		});

		it('applies small size', () => {
			const {container} = render(<Hero size='small' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-16', 'md:py-20');
		});

		it('applies large size', () => {
			const {container} = render(<Hero size='large' />);
			const section = container.querySelector('section');
			expect(section).toHaveClass('py-28', 'md:py-36');
		});
	});

	it('renders section element', () => {
		const {container} = render(<Hero />);
		const section = container.querySelector('section');
		expect(section).toBeInTheDocument();
	});

	it('renders decorative elements', () => {
		const {container} = render(<Hero />);
		const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
		expect(decorativeElements.length).toBeGreaterThan(0);
	});
});

describe('HeroInfo', () => {
	it('exports correct component info', () => {
		expect(HeroInfo.name).toBe('Hero');
		expect(HeroInfo.component).toBeDefined();
		expect(HeroInfo.inputs).toBeInstanceOf(Array);
	});

	it('has size input', () => {
		const sizeInput = HeroInfo.inputs.find(i => i.name === 'size');
		expect(sizeInput).toBeDefined();
		expect(sizeInput?.enum).toContain('compact');
		expect(sizeInput?.enum).toContain('medium');
	});

	it('has backgroundImage input', () => {
		const bgInput = HeroInfo.inputs.find(i => i.name === 'backgroundImage');
		expect(bgInput).toBeDefined();
		expect(bgInput?.type).toBe('file');
	});
});
