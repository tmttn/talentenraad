import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {useState} from 'react';
import {
  EditModeProvider,
  useEditMode,
  useEditModeOptional,
} from '@components/builder/edit-mode-context';

// Test component that uses the context
function TestConsumer() {
  const editMode = useEditMode();
  const [saveResult, setSaveResult] = useState<string>('not-saved');
  return (
    <div>
      <span data-testid='edit-mode'>{editMode.isEditMode ? 'editing' : 'viewing'}</span>
      <span data-testid='saving'>{editMode.isSaving ? 'saving' : 'not-saving'}</span>
      <span data-testid='changes'>{editMode.hasUnsavedChanges ? 'has-changes' : 'no-changes'}</span>
      <span data-testid='change-count'>{editMode.pendingChanges.size}</span>
      <span data-testid='is-admin'>{editMode.isAdmin ? 'admin' : 'not-admin'}</span>
      <span data-testid='save-result'>{saveResult}</span>
      <button
        type='button'
        onClick={editMode.enterEditMode}
        data-testid='enter-edit'
      >
        Enter Edit Mode
      </button>
      <button
        type='button'
        onClick={editMode.exitEditMode}
        data-testid='exit-edit'
      >
        Exit Edit Mode
      </button>
      <button
        type='button'
        onClick={() => {
          editMode.registerChange({
            contentId: 'test-id',
            model: 'test-model',
            field: 'title',
            value: 'New Title',
            originalValue: 'Old Title',
          });
        }}
        data-testid='register-change'
      >
        Register Change
      </button>
      <button
        type='button'
        onClick={() => {
          // Register change where value equals original (should remove)
          editMode.registerChange({
            contentId: 'test-id',
            model: 'test-model',
            field: 'title',
            value: 'Original Value',
            originalValue: 'Original Value',
          });
        }}
        data-testid='register-same-value'
      >
        Register Same Value
      </button>
      <button
        type='button'
        onClick={() => {
          editMode.registerChange({
            contentId: 'test-id',
            model: 'test-model',
            field: 'description',
            value: 'New Description',
            originalValue: 'Old Description',
          });
        }}
        data-testid='register-another-change'
      >
        Register Another Change
      </button>
      <button
        type='button'
        onClick={() => {
          editMode.clearChange('test-id:title');
        }}
        data-testid='clear-change'
      >
        Clear Change
      </button>
      <button
        type='button'
        onClick={async () => {
          const result = await editMode.saveAllChanges();
          setSaveResult(result ? 'success' : 'failed');
        }}
        data-testid='save-all'
      >
        Save All
      </button>
      <button
        type='button'
        onClick={editMode.discardAllChanges}
        data-testid='discard-all'
      >
        Discard All
      </button>
    </div>
  );
}

function TestOptionalConsumer() {
  const editMode = useEditModeOptional();
  return (
    <div>
      <span data-testid='has-context'>{editMode ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('EditModeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('provides default values', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('viewing');
    expect(screen.getByTestId('saving')).toHaveTextContent('not-saving');
    expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');
    expect(screen.getByTestId('change-count')).toHaveTextContent('0');
  });

  it('passes isAdmin prop correctly', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('is-admin')).toHaveTextContent('admin');
  });

  it('enters edit mode', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('viewing');

    fireEvent.click(screen.getByTestId('enter-edit'));

    expect(screen.getByTestId('edit-mode')).toHaveTextContent('editing');
  });

  it('exits edit mode', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    fireEvent.click(screen.getByTestId('enter-edit'));
    expect(screen.getByTestId('edit-mode')).toHaveTextContent('editing');

    fireEvent.click(screen.getByTestId('exit-edit'));
    expect(screen.getByTestId('edit-mode')).toHaveTextContent('viewing');
  });

  it('registers changes', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');

    fireEvent.click(screen.getByTestId('register-change'));

    expect(screen.getByTestId('changes')).toHaveTextContent('has-changes');
    expect(screen.getByTestId('change-count')).toHaveTextContent('1');
  });

  it('clears specific change', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    fireEvent.click(screen.getByTestId('register-change'));
    expect(screen.getByTestId('changes')).toHaveTextContent('has-changes');

    fireEvent.click(screen.getByTestId('clear-change'));
    expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');
  });

  it('updates existing change for same field', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    // Register same change twice
    fireEvent.click(screen.getByTestId('register-change'));
    fireEvent.click(screen.getByTestId('register-change'));

    // Should still only have 1 change (updated, not added)
    expect(screen.getByTestId('change-count')).toHaveTextContent('1');
  });

  it('useEditModeOptional returns null outside provider', () => {
    render(<TestOptionalConsumer />);

    expect(screen.getByTestId('has-context')).toHaveTextContent('no');
  });

  it('useEditModeOptional returns context inside provider', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestOptionalConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('has-context')).toHaveTextContent('yes');
  });

  it('useEditMode throws error outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useEditMode must be used within EditModeProvider');

    consoleSpy.mockRestore();
  });

  it('removes change when value equals original value', () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    // First register a change
    fireEvent.click(screen.getByTestId('register-change'));
    expect(screen.getByTestId('change-count')).toHaveTextContent('1');

    // Now register with same value as original (should remove)
    fireEvent.click(screen.getByTestId('register-same-value'));
    expect(screen.getByTestId('change-count')).toHaveTextContent('0');
    expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');
  });

  it('saveAllChanges returns true when no pending changes', async () => {
    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('save-result')).toHaveTextContent('success');
    });
  });

  it('saveAllChanges calls API and clears changes on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ok: true});

    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    // Register a change
    fireEvent.click(screen.getByTestId('register-change'));
    expect(screen.getByTestId('changes')).toHaveTextContent('has-changes');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('save-result')).toHaveTextContent('success');
      expect(screen.getByTestId('changes')).toHaveTextContent('no-changes');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/builder/save', expect.objectContaining({
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
    }));
  });

  it('saveAllChanges groups changes by contentId', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ok: true});

    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    // Register two changes for same contentId
    fireEvent.click(screen.getByTestId('register-change'));
    fireEvent.click(screen.getByTestId('register-another-change'));
    expect(screen.getByTestId('change-count')).toHaveTextContent('2');

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('save-result')).toHaveTextContent('success');
    });

    // Should have made only 1 API call (grouped by contentId)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('saveAllChanges returns false on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ok: false});

    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    fireEvent.click(screen.getByTestId('register-change'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('save-result')).toHaveTextContent('failed');
      // Changes should not be cleared on failure
      expect(screen.getByTestId('changes')).toHaveTextContent('has-changes');
    });
  });

  it('saveAllChanges handles fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <EditModeProvider isAdmin={true}>
        <TestConsumer />
      </EditModeProvider>,
    );

    fireEvent.click(screen.getByTestId('register-change'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('save-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('save-result')).toHaveTextContent('failed');
    });

    consoleSpy.mockRestore();
  });

  it('passes isAdmin=false correctly', () => {
    render(
      <EditModeProvider isAdmin={false}>
        <TestConsumer />
      </EditModeProvider>,
    );

    expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin');
  });
});
