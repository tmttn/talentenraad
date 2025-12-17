'use client';

import {useEditor, EditorContent, type Editor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

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

function Toolbar({editor}: {editor: Editor | null}) {
	if (!editor) {
		return null;
	}

	const addLink = () => {
		// eslint-disable-next-line no-alert
		const url = prompt('Voer de URL in:');
		if (url) {
			editor.chain().focus().extendMarkRange('link').setLink({href: url}).run();
		}
	};

	return (
		<div className='flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg'>
			{/* Text formatting */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleBold().run();
				}}
				isActive={editor.isActive('bold')}
				title='Vet (Ctrl+B)'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
					<path d='M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' />
					<path d='M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' />
				</svg>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleItalic().run();
				}}
				isActive={editor.isActive('italic')}
				title='Cursief (Ctrl+I)'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<line x1='19' y1='4' x2='10' y2='4' />
					<line x1='14' y1='20' x2='5' y2='20' />
					<line x1='15' y1='4' x2='9' y2='20' />
				</svg>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleUnderline().run();
				}}
				isActive={editor.isActive('underline')}
				title='Onderstrepen (Ctrl+U)'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<path d='M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3' />
					<line x1='4' y1='21' x2='20' y2='21' />
				</svg>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleStrike().run();
				}}
				isActive={editor.isActive('strike')}
				title='Doorhalen'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<line x1='4' y1='12' x2='20' y2='12' />
					<path d='M17.5 7.5c-.7-1.3-2.2-2.5-5.5-2.5C8 5 5.5 7.5 7 10c.8 1.3 2.6 2 5 2' />
					<path d='M6.5 16.5c.7 1.3 2.2 2.5 5.5 2.5 4 0 6.5-2.5 5-5-.8-1.3-2.6-2-5-2' />
				</svg>
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
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<line x1='9' y1='6' x2='20' y2='6' />
					<line x1='9' y1='12' x2='20' y2='12' />
					<line x1='9' y1='18' x2='20' y2='18' />
					<circle cx='5' cy='6' r='1' fill='currentColor' />
					<circle cx='5' cy='12' r='1' fill='currentColor' />
					<circle cx='5' cy='18' r='1' fill='currentColor' />
				</svg>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().toggleOrderedList().run();
				}}
				isActive={editor.isActive('orderedList')}
				title='Genummerde lijst'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<line x1='10' y1='6' x2='20' y2='6' />
					<line x1='10' y1='12' x2='20' y2='12' />
					<line x1='10' y1='18' x2='20' y2='18' />
					<text x='4' y='8' className='text-[10px]' fill='currentColor' stroke='none'>1</text>
					<text x='4' y='14' className='text-[10px]' fill='currentColor' stroke='none'>2</text>
					<text x='4' y='20' className='text-[10px]' fill='currentColor' stroke='none'>3</text>
				</svg>
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
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='currentColor'>
					<path d='M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z' />
				</svg>
			</ToolbarButton>

			{/* Link */}
			<ToolbarButton
				onClick={addLink}
				isActive={editor.isActive('link')}
				title='Link toevoegen'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
					<path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
				</svg>
			</ToolbarButton>
			{editor.isActive('link') && (
				<ToolbarButton
					onClick={() => {
						editor.chain().focus().unsetLink().run();
					}}
					title='Link verwijderen'
				>
					<svg className='w-4 h-4 sm:w-5 sm:h-5 text-red-500' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
						<path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
						<line x1='4' y1='4' x2='20' y2='20' />
					</svg>
				</ToolbarButton>
			)}

			<div className='w-px h-6 bg-gray-300 mx-1 self-center' />

			{/* Undo/Redo */}
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().undo().run();
				}}
				disabled={!editor.can().undo()}
				title='Ongedaan maken (Ctrl+Z)'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<path d='M3 7v6h6' />
					<path d='M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13' />
				</svg>
			</ToolbarButton>
			<ToolbarButton
				onClick={() => {
					editor.chain().focus().redo().run();
				}}
				disabled={!editor.can().redo()}
				title='Opnieuw (Ctrl+Y)'
			>
				<svg className='w-4 h-4 sm:w-5 sm:h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<path d='M21 7v6h-6' />
					<path d='M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7' />
				</svg>
			</ToolbarButton>
		</div>
	);
}

// Convert plain text with newlines to HTML paragraphs
function convertToHtml(text: string): string {
	// If it already contains HTML tags, return as-is
	if (/<[a-z][\s\S]*>/i.test(text)) {
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

export function RichTextEditor({value, onChange, placeholder}: RichTextEditorProps) {
	const htmlContent = convertToHtml(value);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [2, 3],
				},
			}),
			Link.configure({
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
			onChange(currentEditor.getHTML());
		},
	});

	return (
		<div className='border-2 border-gray-300 rounded-lg bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors'>
			<Toolbar editor={editor} />
			{editor?.isEmpty && placeholder && (
				<div className='absolute px-4 py-3 text-gray-400 pointer-events-none'>
					{placeholder}
				</div>
			)}
			<EditorContent editor={editor} />
		</div>
	);
}
