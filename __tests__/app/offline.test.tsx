import {render, screen} from '@testing-library/react';
import OfflinePage from '../../app/offline/page';

describe('OfflinePage', () => {
  it('says you are offline and offers a retry and the way home', () => {
    render(<OfflinePage />);
    expect(screen.getByRole('heading', {level: 1, name: 'Je bent offline'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Probeer opnieuw/})).toHaveClass('contour-sm');
    expect(screen.getByRole('link', {name: /Naar home/})).toHaveAttribute('href', '/');
  });
});
