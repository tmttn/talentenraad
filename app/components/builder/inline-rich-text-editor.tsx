'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link,
  Unlink,
} from 'lucide-react';
import {useEditModeOptional} from './edit-mode-context';

type InlineRichTextEditorProps = {
  contentId: string;
  model: string;
  field: string;
  value: string;
  className?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({onClick, isActive, title, children}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors hover:bg-white/20 ${isActive ? 'bg-white/30 text-white' : 'text-white/80'}`}
    >
      {children}
    </button>
  );
}

export function InlineRichTextEditor({
  contentId,
  model,
  field,
  value,
  className = '',
}: InlineRichTextEditorProps) {
  const editMode = useEditModeOptional();
  const originalValueRef = useRef(value);
  const [isFocused, setIsFocused] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({top: 0, left: 0});
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Underline,
    ],
    content: value,
    editable: editMode?.isEditMode ?? false,
    editorProps: {
      attributes: {
        class: `outline-none ${className}`,
      },
    },
    onFocus() {
      setIsFocused(true);
      updateToolbarPosition();
    },
    onBlur({editor: currentEditor}) {
      // Delay to allow clicking toolbar buttons
      setTimeout(() => {
        setIsFocused(false);
        const newValue = currentEditor.getHTML();

        // Register the change if value changed
        if (editMode && newValue !== originalValueRef.current) {
          editMode.registerChange({
            contentId,
            model,
            field,
            value: newValue,
            originalValue: originalValueRef.current,
          });
        }
      }, 200);
    },
    onSelectionUpdate() {
      updateToolbarPosition();
    },
  });

  const updateToolbarPosition = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    setToolbarPosition({
      top: rect.top - 45,
      left: rect.left,
    });
  }, []);

  // Update editable state when edit mode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editMode?.isEditMode ?? false);
    }
  }, [editor, editMode?.isEditMode]);

  // Update content when value prop changes (but not during editing)
  useEffect(() => {
    if (editor && !isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      originalValueRef.current = value;
    }
  }, [editor, value, isFocused]);

  const addLink = useCallback(() => {
    if (!editor) {
      return;
    }

    const url = prompt('Voer de URL in:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({href: url}).run();
    }
  }, [editor]);

  // If not in edit mode, render as static HTML
  if (!editMode?.isEditMode) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{__html: value}}
      />
    );
  }

  const editorClasses = [
    className,
    'transition-all duration-200',
    'hover:ring-2 hover:ring-primary/30 hover:bg-primary/5 rounded cursor-text px-1 -mx-1',
    isFocused ? 'ring-2 ring-primary bg-primary/5' : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className='relative'>
      {/* Floating toolbar */}
      {editor && isFocused && (
        <div
          className='fixed z-50 flex items-center gap-0.5 px-2 py-1 bg-gray-800 rounded-lg shadow-lg'
          style={{
            top: `${Math.max(10, toolbarPosition.top)}px`,
            left: `${toolbarPosition.left}px`,
          }}
          onMouseDown={e => {
            e.preventDefault();
          }}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title='Vet'
          >
            <Bold className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title='Cursief'
          >
            <Italic className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title='Onderstrepen'
          >
            <UnderlineIcon className='w-4 h-4' />
          </ToolbarButton>

          <div className='w-px h-4 bg-white/20 mx-1' />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title='Opsomming'
          >
            <List className='w-4 h-4' />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title='Genummerde lijst'
          >
            <ListOrdered className='w-4 h-4' />
          </ToolbarButton>

          <div className='w-px h-4 bg-white/20 mx-1' />

          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title='Link toevoegen'
          >
            <Link className='w-4 h-4' />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title='Link verwijderen'
            >
              <Unlink className='w-4 h-4 text-red-400' />
            </ToolbarButton>
          )}
        </div>
      )}

      <div className={editorClasses}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
