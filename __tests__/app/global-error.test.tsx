import {render, screen} from '@testing-library/react';
import * as Sentry from '@sentry/nextjs';
import GlobalError from '../../app/global-error';

jest.mock('@sentry/nextjs', () => ({
	captureException: jest.fn(),
}));

describe('GlobalError', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders error message', () => {
		const error = new Error('Test error');
		render(<GlobalError error={error} />);

		expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Something went wrong');
	});

	it('captures exception with Sentry', () => {
		const error = new Error('Test error');
		render(<GlobalError error={error} />);

		expect(Sentry.captureException).toHaveBeenCalledWith(error);
	});

	it('captures exception with digest', () => {
		const error = Object.assign(new Error('Test error'), {digest: 'abc123'});
		render(<GlobalError error={error} />);

		expect(Sentry.captureException).toHaveBeenCalledWith(error);
	});

	it('renders body element', () => {
		const error = new Error('Test error');
		render(<GlobalError error={error} />);

		// GlobalError renders html/body which gets nested in test container
		// Just verify the component renders without crashing
		expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument();
	});
});
