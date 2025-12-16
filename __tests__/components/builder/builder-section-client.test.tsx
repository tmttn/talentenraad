import {render} from '@testing-library/react';
import {BuilderSectionClient} from '../../../app/components/builder/builder-section-client';

// Mock Builder.io Content component
jest.mock('@builder.io/sdk-react-nextjs', () => ({
	Content: jest.fn(({content, model}) => (
		<div data-testid='builder-content' data-model={model}>
			{content?.data?.title ?? 'Mock Content'}
		</div>
	)),
}));

describe('BuilderSectionClient', () => {
	const mockContent = {
		id: 'test-id',
		data: {
			title: 'Test Section',
			blocks: [],
		},
	};

	const mockApiKey = 'test-api-key';

	it('renders Content component with correct props', () => {
		const {getByTestId} = render(
			<BuilderSectionClient
				content={mockContent}
				model='test-model'
				apiKey={mockApiKey}
			/>,
		);

		const content = getByTestId('builder-content');
		expect(content).toBeInTheDocument();
		expect(content).toHaveAttribute('data-model', 'test-model');
	});

	it('passes content to Content component', () => {
		const {getByText} = render(
			<BuilderSectionClient
				content={mockContent}
				model='test-model'
				apiKey={mockApiKey}
			/>,
		);

		expect(getByText('Test Section')).toBeInTheDocument();
	});

	it('renders with different model names', () => {
		const models = ['hero-section', 'cta-section', 'faq-section', 'announcement-bar'];

		for (const model of models) {
			const {getByTestId, unmount} = render(
				<BuilderSectionClient
					content={mockContent}
					model={model}
					apiKey={mockApiKey}
				/>,
			);

			expect(getByTestId('builder-content')).toHaveAttribute('data-model', model);
			unmount();
		}
	});
});
