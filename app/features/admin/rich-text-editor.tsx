'use client';

import {useState, useRef} from 'react';
import {useEditor, EditorContent, type Editor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
	Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered,
	Quote, Link, Unlink, Undo, Redo, Code,
} from 'lucide-react';

type RichTextEditorProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

const buttonStyles = [
	'p-1.5 sm:p-2 rounded transition-colors',
	'hover:bg-gray-200',
	'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

const activeButtonStyles = 'bg-gray-200';

type ToolbarButtonProps = {
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	title: string;
	children: React.ReactNode;
};

function ToolbarButton({onClick, isActive, disabled, title, children}: ToolbarButtonProps) {
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={`${buttonStyles} ${isActive ? activeButtonStyles : ''}`}
		>
			{children}
		</button>
	);
}

type ToolbarProps = {
	editor: Editor | null;
	isHtmlMode: boolean;
	onToggleHtmlMode: () => void;
};

function Toolbar({editor, isHtmlMode, onToggleHtmlMode}: ToolbarProps) {
	if (!editor) {
		return null;
	}

	const addLink = () => {
		const url = prompt('Voer de URL in:');
		if (url) {
			editor.chain().focus().extendMarkRange('link').setLink({href: url}).run();
		}
	};

	return (
		<div className='flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50 rounded-t-button'>
			{/* Text formatting */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleBold().run();
				}}
				isActive={editor.isActive('bold')}
				title='Vet (Ctrl+B)'
			>
				<Bold className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleItalic().run();
				}}
				isActive={editor.isActive('italic')}
				title='Cursief (Ctrl+I)'
			>
				<Italic className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleUnderline().run();
				}}
				isActive={editor.isActive('underline')}
				title='Onderstrepen (Ctrl+U)'
			>
				<UnderlineIcon className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleStrike().run();
				}}
				isActive={editor.isActive('strike')}
				title='Doorhalen'
			>
				<Strikethrough className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* Headings */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleHeading({level: 2}).run();
				}}
				isActive={editor.isActive('heading', {level: 2})}
				title='Kop 2'
			>
				<span className='text-xs sm:text-sm font-bold'>H2</span>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleHeading({level: 3}).run();
				}}
				isActive={editor.isActive('heading', {level: 3})}
				title='Kop 3'
			>
				<span className='text-xs sm:text-sm font-bold'>H3</span>
			</ToolbarButton>

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* Lists */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleBulletList().run();
				}}
				isActive={editor.isActive('bulletList')}
				title='Opsomming'
			>
				<List className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleOrderedList().run();
				}}
				isActive={editor.isActive('orderedList')}
				title='Genummerde lijst'
			>
				<ListOrdered className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* Blockquote */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleBlockquote().run();
				}}
				isActive={editor.isActive('blockquote')}
				title='Citaat'
			>
				<Quote className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>

			{/* Link */}
			<ToolbarButton
				onClick={addLink}
				isActive={editor.isActive('link')}
				title='Link toevoegen'
			>
				<Link className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			{editor.isActive('link') && (
				<ToolbarButton
					onClick={() => {
						editor.chain().focus().unsetLink().run();
					}}
					title='Link verwijderen'
				>
					<Unlink className='w-4 h-4 sm:w-5 sm:h-5 text-red-500' />
				</ToolbarButton>
			)}

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* Undo/Redo */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().undo().run();
				}}
				disabled={!editor.can().undo() || isHtmlMode}
				title='Ongedaan maken (Ctrl+Z)'
			>
				<Undo className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().redo().run();
				}}
				disabled={!editor.can().redo() || isHtmlMode}
				title='Opnieuw (Ctrl+Y)'
			>
				<Redo className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* HTML Mode Toggle */}
			<ToolbarButton
				onClick={onToggleHtmlMode}
				isActive={isHtmlMode}
				title={isHtmlMode ? 'Visuele modus' : 'HTML modus'}
			>
				<Code className='w-4 h-4 sm:w-5 sm:h-5' />
			</ToolbarButton>
		</div>
	);
}

// Convert plain text with newlines to HTML paragraphs
function convertToHtml(text: string): string {
	// If it already contains HTML tags, return as-is
	if (/<\/?[a-z][^>]*>/i.test(text)) {
		return text;
	}

	// Convert plain text with newlines to paragraphs
	if (!text.trim()) {
		return '';
	}

	return text
		.split(/\n\n+/)
		.map(paragraph => {
			const withBreaks = paragraph.replaceAll('\n', '<br>');
			return `<p>${withBreaks}</p>`;
		})
		.join('');
}

// Format HTML with proper indentation
function formatHtml(html: string): string {
	const selfClosingTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
	let result = '';
	let indent = 0;
	const tab = '  ';

	// Remove existing whitespace between tags
	const cleanHtml = html.replaceAll(/>\s+</g, '><').trim();

	// Split by tags while keeping them
	const tokens = cleanHtml.split(/(<[^>]+>)/g).filter(Boolean);

	for (const token of tokens) {
		if (token.startsWith('</')) {
			// Closing tag - decrease indent first
			indent = Math.max(0, indent - 1);
			result += `${tab.repeat(indent)}${token}\n`;
		} else if (token.startsWith('<')) {
			// Opening tag or self-closing
			const tagMatch = /<(\w+)/.exec(token);
			const tagName = tagMatch?.[1]?.toLowerCase() ?? '';
			const isSelfClosing = selfClosingTags.has(tagName) || token.endsWith('/>');

			result += `${tab.repeat(indent)}${token}\n`;

			if (!isSelfClosing) {
				indent++;
			}
		} else if (token.trim()) {
			// Text content
			result += `${tab.repeat(indent)}${token.trim()}\n`;
		}
	}

	return result.trim();
}

// Syntax highlight HTML - returns JSX-safe highlighted segments
// Uses light colors for dark background (bg-gray-900)
function highlightHtml(html: string): React.ReactNode[] {
	const result: React.ReactNode[] = [];
	let key = 0;

	// Process line by line to maintain structure
	const lines = html.split('\n');

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex];
		let lastIndex = 0;

		// Match tags, attributes, and strings
		const tagRegex = /(<\/?)([\w-]+)((?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*)\s*(\/?>)/g;
		let match;

		while ((match = tagRegex.exec(line)) !== null) {
			// Add text before the tag (light color for dark bg)
			if (match.index > lastIndex) {
				result.push(<span key={key++} className='text-gray-100'>{line.slice(lastIndex, match.index)}</span>);
			}

			const [, bracket, tagName, attributes, closingBracket] = match;

			// Opening bracket
			result.push(<span key={key++} className='text-gray-400'>{bracket}</span>);

			// Tag name
			result.push(<span key={key++} className='text-rose-400'>{tagName}</span>);

			// Attributes
			if (attributes) {
				const attrRegex = /([\w-]+)(=)("[^"]*"|'[^']*'|[^\s>]*)?/g;
				let attrMatch;
				let attrLastIndex = 0;
				const attrString = attributes;

				while ((attrMatch = attrRegex.exec(attrString)) !== null) {
					// Whitespace before attribute
					if (attrMatch.index > attrLastIndex) {
						result.push(<span key={key++} className='text-gray-100'>{attrString.slice(attrLastIndex, attrMatch.index)}</span>);
					}

					const [, attrName, equals, attrValue] = attrMatch;

					// Attribute name
					result.push(<span key={key++} className='text-amber-400'>{attrName}</span>);
					// Equals sign
					result.push(<span key={key++} className='text-gray-400'>{equals}</span>);
					// Attribute value
					if (attrValue) {
						result.push(<span key={key++} className='text-emerald-400'>{attrValue}</span>);
					}

					attrLastIndex = attrMatch.index + attrMatch[0].length;
				}

				// Remaining whitespace
				if (attrLastIndex < attrString.length) {
					result.push(<span key={key++} className='text-gray-100'>{attrString.slice(attrLastIndex)}</span>);
				}
			}

			// Closing bracket
			result.push(<span key={key++} className='text-gray-400'>{closingBracket}</span>);

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text after last tag (light color for dark bg)
		if (lastIndex < line.length) {
			result.push(<span key={key++} className='text-gray-100'>{line.slice(lastIndex)}</span>);
		}

		// Add newline (except for last line)
		if (lineIndex < lines.length - 1) {
			result.push('\n');
		}
	}

	return result;
}

type HtmlEditorProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

function HtmlEditor({value, onChange, placeholder}: HtmlEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const preRef = useRef<HTMLPreElement>(null);

	// Sync scroll between textarea and highlighted pre
	const handleScroll = () => {
		if (textareaRef.current && preRef.current) {
			preRef.current.scrollTop = textareaRef.current.scrollTop;
			preRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	};

	return (
		<div className='relative min-h-[200px] bg-gray-900 rounded-b-button overflow-hidden'>
			{/* Highlighted backdrop */}
			<pre
				ref={preRef}
				className='absolute inset-0 px-3 sm:px-4 py-3 font-mono text-sm leading-relaxed overflow-auto pointer-events-none whitespace-pre-wrap break-words'
				aria-hidden='true'
			>
				<code>{highlightHtml(value)}</code>
			</pre>
			{/* Transparent textarea for editing */}
			<textarea
				ref={textareaRef}
				value={value}
				onChange={event => {
					onChange(event.target.value);
				}}
				onScroll={handleScroll}
				placeholder={placeholder}
				spellCheck={false}
				className='relative w-full min-h-[200px] px-3 sm:px-4 py-3 font-mono text-sm leading-relaxed bg-transparent text-transparent caret-white focus:outline-none resize-y placeholder:text-gray-500'
			/>
		</div>
	);
}

export function RichTextEditor({value, onChange, placeholder}: RichTextEditorProps) {
	const [isHtmlMode, setIsHtmlMode] = useState(false);
	const [htmlValue, setHtmlValue] = useState('');
	const isTogglingRef = useRef(false);
	const htmlContent = convertToHtml(value);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [2, 3],
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
		content: htmlContent,
		editorProps: {
			attributes: {
				class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] px-3 sm:px-4 py-3',
			},
		},
		onUpdate: ({editor: currentEditor}) => {
			// Don't update during toggle to prevent loops
			if (!isTogglingRef.current) {
				onChange(currentEditor.getHTML());
			}
		},
	});

	const handleToggleHtmlMode = () => {
		isTogglingRef.current = true;

		if (isHtmlMode && editor) {
			// Switching from HTML mode to visual mode - update editor with edited HTML
			// Remove formatting (newlines/indentation) before setting content
			const compactHtml = htmlValue.replaceAll(/\n\s*/g, '');
			editor.commands.setContent(compactHtml);
			onChange(compactHtml);
		} else if (editor) {
			// Switching to HTML mode - capture and format current editor content
			const currentHtml = editor.getHTML();
			setHtmlValue(formatHtml(currentHtml));
		}

		setIsHtmlMode(!isHtmlMode);

		// Reset toggle flag after state updates
		setTimeout(() => {
			isTogglingRef.current = false;
		}, 0);
	};

	return (
		<div className='border-2 border-gray-300 rounded-button bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors'>
			<Toolbar editor={editor} isHtmlMode={isHtmlMode} onToggleHtmlMode={handleToggleHtmlMode} />
			{isHtmlMode ? (
				<HtmlEditor
					value={htmlValue}
					onChange={setHtmlValue}
					placeholder={placeholder}
				/>
			) : (
				<>
					{editor?.isEmpty && placeholder && (
						<div className='absolute px-4 py-3 text-gray-400 pointer-events-none'>
							{placeholder}
						</div>
					)}
					<EditorContent editor={editor} />
				</>
			)}
		</div>
	);
}
