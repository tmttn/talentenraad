import {render, screen, fireEvent} from '@testing-library/react';
import {BlockEditor} from '@components/builder/block-editor';

describe('BlockEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  const defaultBlock = {
    '@type': '@builder.io/sdk:Element' as const,
    id: 'test-block-1',
    component: {
      name: 'Hero',
      options: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with component name', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    expect(screen.getByText('Hero bewerken')).toBeInTheDocument();
  });

  it('renders fields for the component', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    expect(screen.getByLabelText('Titel')).toBeInTheDocument();
    expect(screen.getByLabelText('Ondertitel')).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking close button', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking Annuleren button', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    fireEvent.click(screen.getByText('Annuleren'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSave with updated block when clicking Opslaan', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    // Change a field value
    const titleInput = screen.getByLabelText('Titel');
    fireEvent.change(titleInput, {target: {value: 'New Title'}});

    // Click save
    fireEvent.click(screen.getByText('Opslaan'));

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-block-1',
      component: expect.objectContaining({
        name: 'Hero',
        options: expect.objectContaining({
          title: 'New Title',
        }),
      }),
    }));
  });

  it('renders select field for size option', () => {
    render(
      <BlockEditor block={defaultBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    expect(screen.getByLabelText('Grootte')).toBeInTheDocument();
  });

  it('shows message for component without editable properties', () => {
    const emptyBlock = {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'test-block-2',
      component: {
        name: 'UnknownComponent',
        options: {},
      },
    };

    render(
      <BlockEditor block={emptyBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    expect(screen.getByText('Dit component heeft geen bewerkbare eigenschappen.')).toBeInTheDocument();
  });

  it('renders number field correctly', () => {
    const activitiesBlock = {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'test-block-3',
      component: {
        name: 'ActivitiesList',
        options: {
          limit: 5,
        },
      },
    };

    render(
      <BlockEditor block={activitiesBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    const limitInput = screen.getByLabelText('Aantal');
    expect(limitInput).toHaveAttribute('type', 'number');
    expect(limitInput).toHaveValue(5);
  });

  it('renders boolean field correctly', () => {
    const activitiesBlock = {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'test-block-4',
      component: {
        name: 'ActivitiesList',
        options: {
          showPast: true,
        },
      },
    };

    render(
      <BlockEditor block={activitiesBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    const checkbox = screen.getByRole('checkbox', {name: 'Toon afgelopen'});
    expect(checkbox).toBeChecked();
  });

  it('renders textarea field for description', () => {
    const ctaBlock = {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'test-block-5',
      component: {
        name: 'CtaBanner',
        options: {
          description: 'Long description text',
        },
      },
    };

    render(
      <BlockEditor block={ctaBlock} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    // Check that textarea exists and has correct value
    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThan(0);
    const descTextarea = Array.from(textareas).find(
      t => t.value === 'Long description text',
    );
    expect(descTextarea).toBeInTheDocument();
  });

  it('handles block without component name', () => {
    const blockWithoutName = {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'test-block-6',
    };

    render(
      <BlockEditor block={blockWithoutName} onSave={mockOnSave} onClose={mockOnClose} />,
    );

    expect(screen.getByText('Unknown bewerken')).toBeInTheDocument();
  });
});
