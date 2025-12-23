import {render, screen, fireEvent} from '@testing-library/react';
import {ComponentPicker} from '@components/builder/component-picker';

describe('ComponentPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const {container} = render(
      <ComponentPicker isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when open', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );
    expect(screen.getByText('Component toevoegen')).toBeInTheDocument();
  });

  it('shows all category tabs', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );
    expect(screen.getByText('Alle')).toBeInTheDocument();
    // Layout appears both in tab and as category heading
    expect(screen.getAllByText('Layout').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activiteiten').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nieuws').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Team').length).toBeGreaterThan(0);
  });

  it('filters components when searching', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    const searchInput = screen.getByPlaceholderText('Zoek component...');
    fireEvent.change(searchInput, {target: {value: 'Hero'}});

    expect(screen.getByText('Hero')).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking close button', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    const closeButton = screen.getByRole('button', {name: ''});
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('selects a category when clicking category tab', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    // Find the tab button (not the heading)
    const layoutTabs = screen.getAllByText('Layout');
    const layoutTabButton = layoutTabs.find(el => el.closest('button'));
    if (layoutTabButton) {
      fireEvent.click(layoutTabButton);
    }

    // Should show Layout components
    expect(screen.getByText('Sectie')).toBeInTheDocument();
  });

  it('calls onSelect when clicking a component', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    // Find and click Hero component
    const heroButton = screen.getByText('Hero').closest('button');
    if (heroButton) {
      fireEvent.click(heroButton);
    }

    expect(mockOnSelect).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows component descriptions', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    expect(screen.getByText('Grote header met achtergrondafbeelding')).toBeInTheDocument();
  });

  it('filters by search and shows matching results', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    const searchInput = screen.getByPlaceholderText('Zoek component...');
    fireEvent.change(searchInput, {target: {value: 'kalender'}});

    expect(screen.getByText('Kalender Sectie')).toBeInTheDocument();
  });

  it('hides category tabs when searching', () => {
    render(
      <ComponentPicker isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />,
    );

    const searchInput = screen.getByPlaceholderText('Zoek component...');
    fireEvent.change(searchInput, {target: {value: 'hero'}});

    // Category filter tabs should not be visible during search
    const alleButton = screen.queryByRole('button', {name: 'Alle'});
    expect(alleButton).not.toBeInTheDocument();
  });
});
