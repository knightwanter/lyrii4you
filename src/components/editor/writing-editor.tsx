"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Quote, Minus, Undo, Redo, Heading1, Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  icon: Icon,
  active,
  onClick,
  title,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all duration-150",
        active
          ? "bg-primary/20 text-primary-light"
          : "text-text-muted hover:text-text-primary hover:bg-primary-ghost"
      )}
    >
      <Icon size={16} />
    </button>
  );
}

export function WritingEditor({ content, onChange, placeholder }: WritingEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your masterpiece...",
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose-lyrii min-h-[400px] max-h-[70vh] overflow-y-auto px-6 py-4 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="rounded-2xl border border-border bg-bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-bg-tertiary/30 flex-wrap">
        <ToolbarButton
          icon={Heading1}
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        />
        <ToolbarButton
          icon={Heading2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          icon={Bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        />
        <ToolbarButton
          icon={Italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        />
        <ToolbarButton
          icon={Strikethrough}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          icon={List}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        />
        <ToolbarButton
          icon={Quote}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        />
        <ToolbarButton
          icon={Minus}
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          icon={Undo}
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        />
        <ToolbarButton
          icon={Redo}
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        />

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-xs text-text-muted">
          <span>{words} words</span>
          <span>{characters} chars</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
