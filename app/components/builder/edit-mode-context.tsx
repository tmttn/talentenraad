'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type PendingChange = {
  contentId: string;
  model: string;
  field: string;
  value: string;
  originalValue: string;
};

type EditModeContextType = {
  isEditMode: boolean;
  isAdmin: boolean;
  pendingChanges: Map<string, PendingChange>;
  isSaving: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
  registerChange: (change: PendingChange) => void;
  clearChange: (key: string) => void;
  saveAllChanges: () => Promise<boolean>;
  discardAllChanges: () => void;
  hasUnsavedChanges: boolean;
};

const EditModeContext = createContext<EditModeContextType | null>(null);

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }

  return context;
}

export function useEditModeOptional() {
  return useContext(EditModeContext);
}

type EditModeProviderProps = {
  children: ReactNode;
  isAdmin: boolean;
};

export function EditModeProvider({children, isAdmin}: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const registerChange = useCallback((change: PendingChange) => {
    const key = `${change.contentId}:${change.field}`;
    setPendingChanges(prev => {
      const next = new Map(prev);
      // Only register if value actually changed from original
      if (change.value === change.originalValue) {
        next.delete(key);
      } else {
        next.set(key, change);
      }

      return next;
    });
  }, []);

  const clearChange = useCallback((key: string) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const discardAllChanges = useCallback(() => {
    setPendingChanges(new Map());
    // Trigger a page reload to restore original content
    window.location.reload();
  }, []);

  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) {
      return true;
    }

    setIsSaving(true);

    try {
      // Group changes by contentId
      const changesByContent = new Map<string, {model: string; fields: Record<string, string>}>();

      for (const change of pendingChanges.values()) {
        const existing = changesByContent.get(change.contentId);
        if (existing) {
          existing.fields[change.field] = change.value;
        } else {
          changesByContent.set(change.contentId, {
            model: change.model,
            fields: {[change.field]: change.value},
          });
        }
      }

      // Save each content entry
      const results = await Promise.all(
        [...changesByContent.entries()].map(async ([contentId, {model, fields}]) => {
          const response = await fetch('/api/admin/builder/save', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({contentId, model, fields}),
          });
          return response.ok;
        }),
      );

      const allSuccessful = results.every(Boolean);

      if (allSuccessful) {
        setPendingChanges(new Map());
      }

      return allSuccessful;
    } catch (error) {
      console.error('Failed to save changes:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges]);

  const value: EditModeContextType = {
    isEditMode,
    isAdmin,
    pendingChanges,
    isSaving,
    enterEditMode,
    exitEditMode,
    registerChange,
    clearChange,
    saveAllChanges,
    discardAllChanges,
    hasUnsavedChanges: pendingChanges.size > 0,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}
