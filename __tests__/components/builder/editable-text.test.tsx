import {render, screen} from '@testing-library/react';
import {EditableText} from '@components/builder/editable-text';

// Mock InlineRichTextEditor
jest.mock('@components/builder/inline-rich-text-editor', () => ({
  InlineRichTextEditor: ({value, className}: {value: string; className: string}) => (
    <div data-testid='rich-text-editor' className={className}>
      {value}
    </div>
  ),
}));

// Mock edit mode context
const mockEditMode = {
  isEditMode: false,
  registerChange: jest.fn(),
};

jest.mock('@components/builder/edit-mode-context', () => ({
  useEditModeOptional: () => mockEditMode,
}));

describe('EditableText', () => {
  const defaultProps = {
    contentId: 'test-content-id',
    model: 'page',
    field: 'title',
    value: 'Test Title',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditMode.isEditMode = false;
  });

  describe('outside edit mode', () => {
    it('renders plain text value', () => {
      render(<EditableText {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders with custom tag', () => {
      render(<EditableText {...defaultProps} as='h1' />);
      const element = screen.getByText('Test Title');
      expect(element.tagName).toBe('H1');
    });

    it('applies custom className', () => {
      render(<EditableText {...defaultProps} className='custom-class' />);
      const element = screen.getByText('Test Title');
      expect(element).toHaveClass('custom-class');
    });

    it('renders rich text as HTML when richText is true', () => {
      render(
        <EditableText
          {...defaultProps}
          value='<strong>Bold</strong> text'
          richText={true}
        />,
      );
      const boldElement = screen.getByText('Bold');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('uses span as default tag', () => {
      render(<EditableText {...defaultProps} />);
      const element = screen.getByText('Test Title');
      expect(element.tagName).toBe('SPAN');
    });

    it('renders with div tag', () => {
      render(<EditableText {...defaultProps} as='div' />);
      const element = screen.getByText('Test Title');
      expect(element.tagName).toBe('DIV');
    });

    it('renders with p tag', () => {
      render(<EditableText {...defaultProps} as='p' />);
      const element = screen.getByText('Test Title');
      expect(element.tagName).toBe('P');
    });
  });

  describe('inside edit mode', () => {
    beforeEach(() => {
      mockEditMode.isEditMode = true;
    });

    it('renders contentEditable element in edit mode', () => {
      const {container} = render(<EditableText {...defaultProps} />);
      const editableElement = container.querySelector('[contenteditable="true"]');
      expect(editableElement).toBeInTheDocument();
    });

    it('uses InlineRichTextEditor for rich text in edit mode', () => {
      render(<EditableText {...defaultProps} richText={true} />);
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    });

    it('applies editable styling classes', () => {
      const {container} = render(<EditableText {...defaultProps} />);
      const editableElement = container.querySelector('[contenteditable="true"]');
      expect(editableElement).toHaveClass('outline-none');
      expect(editableElement).toHaveClass('transition-all');
    });
  });
});
