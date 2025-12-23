'use client';

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
} from 'react';
import {useEditModeOptional} from './edit-mode-context';
import {InlineRichTextEditor} from './inline-rich-text-editor';

type EditableTextProps = {
  /** The content ID from Builder.io */
  contentId: string;
  /** The model name (e.g., 'page', 'nieuws', 'activiteit') */
  model: string;
  /** The field name in the content data */
  field: string;
  /** The current value */
  value: string;
  /** HTML tag to render */
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  /** Additional class names */
  className?: string;
  /** Whether this is rich text (HTML content) */
  richText?: boolean;
};

export function EditableText({
  contentId,
  model,
  field,
  value,
  as: Tag = 'span',
  className = '',
  richText = false,
}: EditableTextProps) {
  const editMode = useEditModeOptional();
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const originalValueRef = useRef(value);

  // Update local value when prop changes (but not during editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
      originalValueRef.current = value;
    }
  }, [value, isEditing]);

  // If not in edit mode context or not an admin, render normally
  if (!editMode?.isEditMode) {
    if (richText) {
      return (
        <Tag
          className={className}
          dangerouslySetInnerHTML={{__html: value}}
        />
      );
    }

    return <Tag className={className}>{value}</Tag>;
  }

  // Use rich text editor for HTML content in edit mode
  if (richText) {
    return (
      <InlineRichTextEditor
        contentId={contentId}
        model={model}
        field={field}
        value={value}
        className={className}
      />
    );
  }

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const newValue = elementRef.current?.textContent ?? localValue;
    setLocalValue(newValue);

    // Register the change
    editMode.registerChange({
      contentId,
      model,
      field,
      value: newValue,
      originalValue: originalValueRef.current,
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Revert changes
      setLocalValue(originalValueRef.current);
      if (elementRef.current) {
        elementRef.current.textContent = originalValueRef.current;
      }

      setIsEditing(false);
    } else if (event.key === 'Enter') {
      // Save on Enter for single-line text
      event.preventDefault();
      elementRef.current?.blur();
    }
  };

  const editableClasses = [
    className,
    'outline-none transition-all duration-200',
    isEditing
      ? 'ring-2 ring-primary bg-primary/5 rounded px-1 -mx-1'
      : 'hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded cursor-text px-1 -mx-1',
  ].filter(Boolean).join(' ');

  // Type-safe ref callback
  const setRef = (element: HTMLElement | null) => {
    elementRef.current = element;
  };

  return (
    <Tag
      ref={setRef}
      className={editableClasses}
      contentEditable
      suppressContentEditableWarning
      onClick={handleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {localValue}
    </Tag>
  );
}
