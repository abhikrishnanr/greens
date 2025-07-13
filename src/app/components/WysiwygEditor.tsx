"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, List, Link, Eye, Code } from "lucide-react"

interface WysiwygEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertText = (before: string, after = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-2 p-2 border-b bg-slate-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("**", "**")} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("*", "*")} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("- ")} className="h-8 w-8 p-0">
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("[", "](url)")}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("`", "`")} className="h-8 w-8 p-0">
          <Code className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)} className="h-8 px-3">
            <Eye className="h-4 w-4 mr-1" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreview ? (
        <div
          className="p-4 min-h-[120px] prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: value
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/`(.*?)`/g, "<code>$1</code>")
              .replace(/^- (.+)$/gm, "<li>$1</li>")
              .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
              .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
              .replace(/\n/g, "<br>"),
          }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] border-0 resize-none focus-visible:ring-0"
          placeholder="Enter description... You can use **bold**, *italic*, `code`, - lists, and [links](url)"
        />
      )}
    </div>
  )
}
