import {render, screen} from '@testing-library/react';
import {DecorationInfo, Divider, DividerInfo} from '../../app/components/decorations';

// Get the Decoration component from the info export
const Decoration = DecorationInfo.component;

describe('Decoration', () => {
	it('renders confetti decoration', () => {
		const {container} = render(<Decoration type='confetti' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders stars decoration', () => {
		const {container} = render(<Decoration type='stars' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders hearts decoration', () => {
		const {container} = render(<Decoration type='hearts' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders balloons decoration', () => {
		const {container} = render(<Decoration type='balloons' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders party decoration', () => {
		const {container} = render(<Decoration type='party' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('applies position classes correctly', () => {
		const {container: leftContainer} = render(<Decoration type='confetti' position='left' />);
		expect(leftContainer.querySelector('.left-4')).toBeInTheDocument();

		const {container: rightContainer} = render(<Decoration type='confetti' position='right' />);
		expect(rightContainer.querySelector('.right-4')).toBeInTheDocument();

		const {container: centerContainer} = render(<Decoration type='confetti' position='center' />);
		expect(centerContainer.querySelector('.left-1\\/2')).toBeInTheDocument();
	});

	it('applies size classes correctly', () => {
		const {container: smallContainer} = render(<Decoration type='confetti' size='small' />);
		expect(smallContainer.querySelector('.w-24')).toBeInTheDocument();

		const {container: mediumContainer} = render(<Decoration type='confetti' size='medium' />);
		expect(mediumContainer.querySelector('.w-32')).toBeInTheDocument();

		const {container: largeContainer} = render(<Decoration type='confetti' size='large' />);
		expect(largeContainer.querySelector('.w-48')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Decoration type='confetti' className='custom-class' />);
		expect(container.querySelector('.custom-class')).toBeInTheDocument();
	});

	it('has aria-hidden for accessibility', () => {
		const {container} = render(<Decoration type='confetti' />);
		const wrapper = container.firstChild as Element;
		expect(wrapper).toHaveAttribute('aria-hidden', 'true');
	});

	it('has correct DecorationInfo export properties', () => {
		expect(DecorationInfo.name).toBe('Decoration');
		expect(DecorationInfo.component).toBeDefined();
		expect(DecorationInfo.inputs).toBeDefined();
		expect(DecorationInfo.inputs.length).toBeGreaterThan(0);
	});
});

describe('Divider', () => {
	it('renders wave divider', () => {
		const {container} = render(<Divider type='wave' />);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
		expect(container.querySelector('path')).toBeInTheDocument();
	});

	it('renders curve divider', () => {
		const {container} = render(<Divider type='curve' />);
		const path = container.querySelector('path');
		expect(path).toBeInTheDocument();
	});

	it('renders triangle divider', () => {
		const {container} = render(<Divider type='triangle' />);
		const path = container.querySelector('path');
		expect(path).toBeInTheDocument();
	});

	it('renders zigzag divider', () => {
		const {container} = render(<Divider type='zigzag' />);
		const path = container.querySelector('path');
		expect(path).toBeInTheDocument();
	});

	it('applies color classes correctly', () => {
		const {container: whiteContainer} = render(<Divider type='wave' color='white' />);
		expect(whiteContainer.querySelector('.text-white')).toBeInTheDocument();

		const {container: grayContainer} = render(<Divider type='wave' color='gray' />);
		expect(grayContainer.querySelector('.text-gray-50')).toBeInTheDocument();

		const {container: pinkContainer} = render(<Divider type='wave' color='pink' />);
		expect(pinkContainer.querySelector('.text-primary')).toBeInTheDocument();
	});

	it('applies flip rotation when enabled', () => {
		const {container} = render(<Divider type='wave' flip />);
		expect(container.querySelector('.rotate-180')).toBeInTheDocument();
	});

	it('does not apply flip rotation when disabled', () => {
		const {container} = render(<Divider type='wave' flip={false} />);
		expect(container.querySelector('.rotate-180')).not.toBeInTheDocument();
	});

	it('has aria-hidden for accessibility', () => {
		const {container} = render(<Divider type='wave' />);
		const wrapper = container.firstChild as Element;
		expect(wrapper).toHaveAttribute('aria-hidden', 'true');
	});

	it('has correct DividerInfo export properties', () => {
		expect(DividerInfo.name).toBe('Divider');
		expect(DividerInfo.component).toBeDefined();
		expect(DividerInfo.inputs).toBeDefined();
		expect(DividerInfo.inputs.length).toBeGreaterThan(0);
	});
});
