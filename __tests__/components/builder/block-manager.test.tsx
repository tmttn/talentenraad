import {render, screen, fireEvent} from '@testing-library/react';
import {BlockManager} from '@components/builder/block-manager';

// Mock the dependencies
jest.mock('@components/builder/component-picker', () => ({
  ComponentPicker: ({isOpen, onClose, onSelect}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (component: unknown) => void;
  }) => isOpen ? (
    <div data-testid='component-picker'>
      <button
        type='button'
        onClick={onClose}
        data-testid='picker-close'
      >
        Close Picker
      </button>
      <button
        type='button'
        onClick={() => {
          onSelect({name: 'TestComponent', displayName: 'Test', description: 'Test', defaultProps: {}});
        }}
        data-testid='picker-select'
      >
        Select Component
      </button>
    </div>
  ) : null,
}));

jest.mock('@components/builder/block-editor', () => ({
  BlockEditor: ({block, onSave, onClose}: {
    block: unknown;
    onSave: (block: unknown) => void;
    onClose: () => void;
  }) => (
    <div data-testid='block-editor'>
      <button
        type='button'
        onClick={onClose}
        data-testid='editor-close'
      >
        Close Editor
      </button>
      <button
        type='button'
        onClick={() => {
          onSave(block);
        }}
        data-testid='editor-save'
      >
        Save Block
      </button>
    </div>
  ),
}));

describe('BlockManager', () => {
  const mockOnBlocksChange = jest.fn();
  const mockOnClose = jest.fn();

  const defaultBlocks = [
    {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'block-1',
      component: {name: 'Hero', options: {}},
    },
    {
      '@type': '@builder.io/sdk:Element' as const,
      id: 'block-2',
      component: {name: 'Section', options: {}},
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const {container} = render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders sidebar when open', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Pagina blokken')).toBeInTheDocument();
  });

  it('displays block names', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const backdrop = document.querySelector('.bg-black\\/30');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking close button', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const closeButton = screen.getAllByRole('button').find(
      btn => btn.querySelector('.lucide-x'),
    );
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows empty state when no blocks', () => {
    render(
      <BlockManager
        blocks={[]}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Geen blokken')).toBeInTheDocument();
    expect(screen.getByText('Eerste blok toevoegen')).toBeInTheDocument();
  });

  it('opens component picker when clicking add button', () => {
    render(
      <BlockManager
        blocks={[]}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText('Eerste blok toevoegen'));

    expect(screen.getByTestId('component-picker')).toBeInTheDocument();
  });

  it('adds new block when selecting component from picker', () => {
    render(
      <BlockManager
        blocks={[]}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText('Eerste blok toevoegen'));
    fireEvent.click(screen.getByTestId('picker-select'));

    expect(mockOnBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          component: expect.objectContaining({name: 'TestComponent'}),
        }),
      ]),
    );
  });

  it('deletes block when clicking delete button', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Find delete buttons (trash icons)
    const deleteButtons = screen.getAllByTitle('Verwijderen');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnBlocksChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({id: 'block-2'}),
      ]),
    );
    expect(mockOnBlocksChange).toHaveBeenCalledWith(
      expect.not.arrayContaining([
        expect.objectContaining({id: 'block-1'}),
      ]),
    );
  });

  it('opens block editor when clicking edit button', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const editButtons = screen.getAllByTitle('Bewerken');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('block-editor')).toBeInTheDocument();
  });

  it('saves block when saving from editor', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const editButtons = screen.getAllByTitle('Bewerken');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByTestId('editor-save'));

    expect(mockOnBlocksChange).toHaveBeenCalled();
  });

  it('closes block editor when clicking close', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const editButtons = screen.getAllByTitle('Bewerken');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('block-editor')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('editor-close'));

    expect(screen.queryByTestId('block-editor')).not.toBeInTheDocument();
  });

  it('shows add buttons between blocks', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Should have add buttons: 1 at top + 1 after each block
    const addButtons = screen.getAllByText('Toevoegen');
    expect(addButtons.length).toBe(3);
  });

  it('displays fallback name for block without component', () => {
    const blocksWithoutComponent = [
      {
        '@type': '@builder.io/sdk:Element' as const,
        id: 'block-no-component',
      },
    ];

    render(
      <BlockManager
        blocks={blocksWithoutComponent}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Element')).toBeInTheDocument();
  });

  it('shows footer info text', () => {
    render(
      <BlockManager
        blocks={defaultBlocks}
        onBlocksChange={mockOnBlocksChange}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText(/Sleep blokken om te herschikken/)).toBeInTheDocument();
  });
});
