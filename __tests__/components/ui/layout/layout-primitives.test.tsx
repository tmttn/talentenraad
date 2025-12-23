import {render, screen} from '@testing-library/react';
import {Container, Section, Stack, Cluster, Grid, Divider} from '@components/ui/layout';

describe('Container', () => {
	it('renders children correctly', () => {
		render(<Container>Test content</Container>);
		expect(screen.getByText('Test content')).toBeInTheDocument();
	});

	it('applies default size class (xl)', () => {
		const {container} = render(<Container>Content</Container>);
		expect(container.firstChild).toHaveClass('max-w-6xl');
	});

	it('applies custom size classes', () => {
		const {container: sm} = render(<Container size="sm">Content</Container>);
		expect(sm.firstChild).toHaveClass('max-w-2xl');

		const {container: md} = render(<Container size="md">Content</Container>);
		expect(md.firstChild).toHaveClass('max-w-3xl');

		const {container: lg} = render(<Container size="lg">Content</Container>);
		expect(lg.firstChild).toHaveClass('max-w-5xl');

		const {container: xl2} = render(<Container size="2xl">Content</Container>);
		expect(xl2.firstChild).toHaveClass('max-w-7xl');

		const {container: full} = render(<Container size="full">Content</Container>);
		expect(full.firstChild).toHaveClass('max-w-full');
	});

	it('applies padding by default', () => {
		const {container} = render(<Container>Content</Container>);
		expect(container.firstChild).toHaveClass('px-4');
	});

	it('removes padding when padding={false}', () => {
		const {container} = render(<Container padding={false}>Content</Container>);
		expect(container.firstChild).not.toHaveClass('px-4');
	});

	it('centers by default', () => {
		const {container} = render(<Container>Content</Container>);
		expect(container.firstChild).toHaveClass('mx-auto');
	});

	it('removes centering when center={false}', () => {
		const {container} = render(<Container center={false}>Content</Container>);
		expect(container.firstChild).not.toHaveClass('mx-auto');
	});

	it('renders as different HTML elements', () => {
		const {container: section} = render(<Container as="section">Content</Container>);
		expect(section.querySelector('section')).toBeInTheDocument();

		const {container: article} = render(<Container as="article">Content</Container>);
		expect(article.querySelector('article')).toBeInTheDocument();

		const {container: main} = render(<Container as="main">Content</Container>);
		expect(main.querySelector('main')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Container className="custom-class">Content</Container>);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});

describe('Section', () => {
	it('renders children correctly', () => {
		render(<Section>Test content</Section>);
		expect(screen.getByText('Test content')).toBeInTheDocument();
	});

	it('applies default spacing class (md)', () => {
		const {container} = render(<Section>Content</Section>);
		expect(container.firstChild).toHaveClass('py-section-md');
	});

	it('applies custom spacing classes', () => {
		const {container: none} = render(<Section spacing="none">Content</Section>);
		expect(none.firstChild).not.toHaveClass('py-section-sm', 'py-section-md', 'py-section-lg');

		const {container: sm} = render(<Section spacing="sm">Content</Section>);
		expect(sm.firstChild).toHaveClass('py-section-sm');

		const {container: lg} = render(<Section spacing="lg">Content</Section>);
		expect(lg.firstChild).toHaveClass('py-section-lg');
	});

	it('applies background classes', () => {
		const {container: white} = render(<Section background="white">Content</Section>);
		expect(white.firstChild).toHaveClass('bg-white');

		const {container: gray} = render(<Section background="gray">Content</Section>);
		expect(gray.firstChild).toHaveClass('bg-gray-50');
	});

	it('renders as a section element by default', () => {
		const {container} = render(<Section>Content</Section>);
		expect(container.querySelector('section')).toBeInTheDocument();
	});

	it('renders as different HTML elements', () => {
		const {container: div} = render(<Section as="div">Content</Section>);
		expect(div.querySelector('div')).toBeInTheDocument();

		const {container: article} = render(<Section as="article">Content</Section>);
		expect(article.querySelector('article')).toBeInTheDocument();
	});

	it('applies aria-label when provided', () => {
		render(<Section ariaLabel="Test section">Content</Section>);
		expect(screen.getByRole('region', {name: 'Test section'})).toBeInTheDocument();
	});

	it('applies id when provided', () => {
		const {container} = render(<Section id="test-section">Content</Section>);
		expect(container.querySelector('#test-section')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Section className="custom-class">Content</Section>);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});

describe('Stack', () => {
	it('renders children correctly', () => {
		render(
			<Stack>
				<div>Item 1</div>
				<div>Item 2</div>
			</Stack>,
		);
		expect(screen.getByText('Item 1')).toBeInTheDocument();
		expect(screen.getByText('Item 2')).toBeInTheDocument();
	});

	it('applies flex-col class', () => {
		const {container} = render(<Stack>Content</Stack>);
		expect(container.firstChild).toHaveClass('flex', 'flex-col');
	});

	it('applies default gap class (md)', () => {
		const {container} = render(<Stack>Content</Stack>);
		expect(container.firstChild).toHaveClass('gap-4');
	});

	it('applies custom gap classes', () => {
		const {container: none} = render(<Stack gap="none">Content</Stack>);
		expect(none.firstChild).toHaveClass('gap-0');

		const {container: xs} = render(<Stack gap="xs">Content</Stack>);
		expect(xs.firstChild).toHaveClass('gap-1');

		const {container: sm} = render(<Stack gap="sm">Content</Stack>);
		expect(sm.firstChild).toHaveClass('gap-2');

		const {container: lg} = render(<Stack gap="lg">Content</Stack>);
		expect(lg.firstChild).toHaveClass('gap-6');

		const {container: xl} = render(<Stack gap="xl">Content</Stack>);
		expect(xl.firstChild).toHaveClass('gap-8');
	});

	it('applies default alignment class (stretch)', () => {
		const {container} = render(<Stack>Content</Stack>);
		expect(container.firstChild).toHaveClass('items-stretch');
	});

	it('applies custom alignment classes', () => {
		const {container: start} = render(<Stack align="start">Content</Stack>);
		expect(start.firstChild).toHaveClass('items-start');

		const {container: center} = render(<Stack align="center">Content</Stack>);
		expect(center.firstChild).toHaveClass('items-center');

		const {container: end} = render(<Stack align="end">Content</Stack>);
		expect(end.firstChild).toHaveClass('items-end');
	});

	it('renders as different HTML elements', () => {
		const {container: ul} = render(<Stack as="ul">Content</Stack>);
		expect(ul.querySelector('ul')).toBeInTheDocument();

		const {container: nav} = render(<Stack as="nav">Content</Stack>);
		expect(nav.querySelector('nav')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Stack className="custom-class">Content</Stack>);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});

describe('Cluster', () => {
	it('renders children correctly', () => {
		render(
			<Cluster>
				<div>Item 1</div>
				<div>Item 2</div>
			</Cluster>,
		);
		expect(screen.getByText('Item 1')).toBeInTheDocument();
		expect(screen.getByText('Item 2')).toBeInTheDocument();
	});

	it('applies flex class', () => {
		const {container} = render(<Cluster>Content</Cluster>);
		expect(container.firstChild).toHaveClass('flex');
	});

	it('applies flex-wrap by default', () => {
		const {container} = render(<Cluster>Content</Cluster>);
		expect(container.firstChild).toHaveClass('flex-wrap');
	});

	it('removes flex-wrap when wrap={false}', () => {
		const {container} = render(<Cluster wrap={false}>Content</Cluster>);
		expect(container.firstChild).not.toHaveClass('flex-wrap');
	});

	it('applies default gap class (md)', () => {
		const {container} = render(<Cluster>Content</Cluster>);
		expect(container.firstChild).toHaveClass('gap-4');
	});

	it('applies custom gap classes', () => {
		const {container: none} = render(<Cluster gap="none">Content</Cluster>);
		expect(none.firstChild).toHaveClass('gap-0');

		const {container: xs} = render(<Cluster gap="xs">Content</Cluster>);
		expect(xs.firstChild).toHaveClass('gap-1');

		const {container: lg} = render(<Cluster gap="lg">Content</Cluster>);
		expect(lg.firstChild).toHaveClass('gap-6');
	});

	it('applies default alignment class (center)', () => {
		const {container} = render(<Cluster>Content</Cluster>);
		expect(container.firstChild).toHaveClass('items-center');
	});

	it('applies custom alignment classes', () => {
		const {container: start} = render(<Cluster align="start">Content</Cluster>);
		expect(start.firstChild).toHaveClass('items-start');

		const {container: baseline} = render(<Cluster align="baseline">Content</Cluster>);
		expect(baseline.firstChild).toHaveClass('items-baseline');
	});

	it('applies default justify class (start)', () => {
		const {container} = render(<Cluster>Content</Cluster>);
		expect(container.firstChild).toHaveClass('justify-start');
	});

	it('applies custom justify classes', () => {
		const {container: center} = render(<Cluster justify="center">Content</Cluster>);
		expect(center.firstChild).toHaveClass('justify-center');

		const {container: between} = render(<Cluster justify="between">Content</Cluster>);
		expect(between.firstChild).toHaveClass('justify-between');

		const {container: evenly} = render(<Cluster justify="evenly">Content</Cluster>);
		expect(evenly.firstChild).toHaveClass('justify-evenly');
	});

	it('renders as different HTML elements', () => {
		const {container: ul} = render(<Cluster as="ul">Content</Cluster>);
		expect(ul.querySelector('ul')).toBeInTheDocument();

		const {container: nav} = render(<Cluster as="nav">Content</Cluster>);
		expect(nav.querySelector('nav')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Cluster className="custom-class">Content</Cluster>);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});

describe('Grid', () => {
	it('renders children correctly', () => {
		render(
			<Grid>
				<div>Item 1</div>
				<div>Item 2</div>
			</Grid>,
		);
		expect(screen.getByText('Item 1')).toBeInTheDocument();
		expect(screen.getByText('Item 2')).toBeInTheDocument();
	});

	it('applies grid class', () => {
		const {container} = render(<Grid>Content</Grid>);
		expect(container.firstChild).toHaveClass('grid');
	});

	it('applies default columns (1)', () => {
		const {container} = render(<Grid>Content</Grid>);
		expect(container.firstChild).toHaveClass('grid-cols-1');
	});

	it('applies custom column counts', () => {
		const {container: cols2} = render(<Grid cols={2}>Content</Grid>);
		expect(cols2.firstChild).toHaveClass('grid-cols-2');

		const {container: cols3} = render(<Grid cols={3}>Content</Grid>);
		expect(cols3.firstChild).toHaveClass('grid-cols-3');

		const {container: cols4} = render(<Grid cols={4}>Content</Grid>);
		expect(cols4.firstChild).toHaveClass('grid-cols-4');
	});

	it('applies responsive column classes', () => {
		const {container} = render(
			<Grid cols={1} colsSm={2} colsMd={3} colsLg={4} colsXl={6}>
				Content
			</Grid>,
		);
		expect(container.firstChild).toHaveClass('grid-cols-1');
		expect(container.firstChild).toHaveClass('sm:grid-cols-2');
		expect(container.firstChild).toHaveClass('md:grid-cols-3');
		expect(container.firstChild).toHaveClass('lg:grid-cols-4');
		expect(container.firstChild).toHaveClass('xl:grid-cols-6');
	});

	it('applies default gap class (md)', () => {
		const {container} = render(<Grid>Content</Grid>);
		expect(container.firstChild).toHaveClass('gap-6');
	});

	it('applies custom gap classes', () => {
		const {container: none} = render(<Grid gap="none">Content</Grid>);
		expect(none.firstChild).toHaveClass('gap-0');

		const {container: sm} = render(<Grid gap="sm">Content</Grid>);
		expect(sm.firstChild).toHaveClass('gap-4');

		const {container: lg} = render(<Grid gap="lg">Content</Grid>);
		expect(lg.firstChild).toHaveClass('gap-8');

		const {container: xl} = render(<Grid gap="xl">Content</Grid>);
		expect(xl.firstChild).toHaveClass('gap-12');
	});

	it('renders as different HTML elements', () => {
		const {container: ul} = render(<Grid as="ul">Content</Grid>);
		expect(ul.querySelector('ul')).toBeInTheDocument();

		const {container: section} = render(<Grid as="section">Content</Grid>);
		expect(section.querySelector('section')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Grid className="custom-class">Content</Grid>);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});

describe('Divider', () => {
	it('renders as an hr element', () => {
		const {container} = render(<Divider />);
		expect(container.querySelector('hr')).toBeInTheDocument();
	});

	it('is horizontal by default', () => {
		const {container} = render(<Divider />);
		expect(container.firstChild).toHaveClass('w-full', 'border-t');
		expect(container.firstChild).toHaveAttribute('aria-orientation', 'horizontal');
	});

	it('can be vertical', () => {
		const {container} = render(<Divider orientation="vertical" />);
		expect(container.firstChild).toHaveClass('h-full', 'border-l');
		expect(container.firstChild).toHaveAttribute('aria-orientation', 'vertical');
	});

	it('applies default spacing class (md)', () => {
		const {container: horizontal} = render(<Divider />);
		expect(horizontal.firstChild).toHaveClass('my-4');

		const {container: vertical} = render(<Divider orientation="vertical" />);
		expect(vertical.firstChild).toHaveClass('mx-4');
	});

	it('applies custom horizontal spacing classes', () => {
		const {container: none} = render(<Divider spacing="none" />);
		expect(none.firstChild).not.toHaveClass('my-2', 'my-4', 'my-8');

		const {container: sm} = render(<Divider spacing="sm" />);
		expect(sm.firstChild).toHaveClass('my-2');

		const {container: lg} = render(<Divider spacing="lg" />);
		expect(lg.firstChild).toHaveClass('my-8');
	});

	it('applies custom vertical spacing classes', () => {
		const {container: none} = render(<Divider orientation="vertical" spacing="none" />);
		expect(none.firstChild).not.toHaveClass('mx-2', 'mx-4', 'mx-8');

		const {container: sm} = render(<Divider orientation="vertical" spacing="sm" />);
		expect(sm.firstChild).toHaveClass('mx-2');

		const {container: lg} = render(<Divider orientation="vertical" spacing="lg" />);
		expect(lg.firstChild).toHaveClass('mx-8');
	});

	it('applies default color class (default)', () => {
		const {container} = render(<Divider />);
		expect(container.firstChild).toHaveClass('border-gray-200');
	});

	it('applies custom color classes', () => {
		const {container: light} = render(<Divider color="light" />);
		expect(light.firstChild).toHaveClass('border-gray-100');

		const {container: dark} = render(<Divider color="dark" />);
		expect(dark.firstChild).toHaveClass('border-gray-300');
	});

	it('has role="presentation" by default', () => {
		const {container} = render(<Divider />);
		expect(container.firstChild).toHaveAttribute('role', 'presentation');
	});

	it('has role="separator" when label is provided', () => {
		render(<Divider label="Section divider" />);
		expect(screen.getByRole('separator', {name: 'Section divider'})).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const {container} = render(<Divider className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});
