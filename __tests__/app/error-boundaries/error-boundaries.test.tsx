import {render} from '@testing-library/react';
import MainError from '../../../app/(main)/error';
import AdminError from '../../../app/(admin)/admin/error';
import ProtectedAdminError from '../../../app/(admin)/admin/(protected)/error';

const boundaries = [
  ['main', MainError],
  ['admin', AdminError],
  ['protected admin', ProtectedAdminError],
] as const;

describe.each(boundaries)('%s error boundary', (_name, Boundary) => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('logs the error and still renders the error page', () => {
    const error = Object.assign(new Error('boom'), {digest: 'abc'});
    const {container} = render(<Boundary error={error} reset={vi.fn()} />);

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(container).not.toBeEmptyDOMElement();
  });
});
