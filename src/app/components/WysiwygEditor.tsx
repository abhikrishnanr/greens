"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useEffect } from "react";

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
    <div className={`rounded border bg-black p-2 text-secondary ${className}`}>
      <div className="mb-2 flex gap-1 flex-wrap">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold text-primary' : ''}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic text-primary' : ''}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'text-primary underline' : ''}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'text-primary underline' : ''}>H2</button>
        <input type="color" onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
        <button onClick={() => editor.chain().focus().unsetColor().run()}>No Color</button>
      </div>
      <EditorContent editor={editor} className="min-h-[120px] bg-black text-secondary p-2 rounded" />
    </div>
  )
}
