import {render, screen} from '@testing-library/react';
import BuilderPreviewLayout from '../../../app/(builder-preview)/layout';

describe('BuilderPreviewLayout', () => {
  it('renders children', () => {
    render(<BuilderPreviewLayout>
      <div data-testid='child-content'>Test Content</div>
    </BuilderPreviewLayout>);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('has builder-preview class', () => {
    const {container} = render(<BuilderPreviewLayout>
      <div>Content</div>
    </BuilderPreviewLayout>);

    const wrapper = container.querySelector('.builder-preview');
    expect(wrapper).toBeInTheDocument();
  });

  it('has min-h-screen class for full height', () => {
    const {container} = render(<BuilderPreviewLayout>
      <div>Content</div>
    </BuilderPreviewLayout>);

    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
  });
});
