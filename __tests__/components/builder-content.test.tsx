import {render, screen} from '@testing-library/react';
import {BuilderContent} from '../../app/components/builder/builder-content';

describe('BuilderContent', () => {
	const defaultProps = {
		content: {id: '123', name: 'Test Page'} as never,
		apiKey: 'test-api-key',
		model: 'page',
	};

	it('renders Builder Content component', () => {
		render(<BuilderContent {...defaultProps} />);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
	});

	it('passes content to Builder Content', () => {
		render(<BuilderContent {...defaultProps} />);

		const builderContent = screen.getByTestId('builder-content');
		expect(builderContent).toHaveAttribute('data-content', JSON.stringify(defaultProps.content));
	});

	it('registers custom components', () => {
		render(<BuilderContent {...defaultProps} />);

		const builderContent = screen.getByTestId('builder-content');
		expect(builderContent).toHaveAttribute('data-components', '26');
	});

	it('renders with null content', () => {
		render(<BuilderContent {...defaultProps} content={null} />);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
	});

	it('renders with different model', () => {
		render(<BuilderContent {...defaultProps} model="blog-post" />);

		expect(screen.getByTestId('builder-content')).toBeInTheDocument();
	});
});
