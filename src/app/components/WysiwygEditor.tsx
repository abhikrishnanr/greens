"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useEffect } from 'react'
import { MdFormatBold, MdFormatItalic, MdLooksOne, MdLooksTwo } from 'react-icons/md'

export default function WysiwygEditor({ value, onChange, className = '' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className={`rounded border bg-white p-2 text-gray-800 ${className}`}>
      <div className="mb-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-green-100 ${editor.isActive('bold') ? 'bg-green-200' : ''}`}
        >
          <MdFormatBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-green-100 ${editor.isActive('italic') ? 'bg-green-200' : ''}`}
        >
          <MdFormatItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded hover:bg-green-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-green-200' : ''}`}
        >
          <MdLooksOne />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded hover:bg-green-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-green-200' : ''}`}
        >
          <MdLooksTwo />
        </button>
        <input
          type="color"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          className="h-8 w-8 p-0 border rounded"
        />
        <button type="button" onClick={() => editor.chain().focus().unsetColor().run()} className="p-1 rounded hover:bg-green-100">
          Reset
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[120px] bg-white text-gray-800 p-2 rounded border" />
    </div>
  )
}
