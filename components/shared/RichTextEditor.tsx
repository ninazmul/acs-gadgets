"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ListItem from "@tiptap/extension-list-item";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Code as CodeIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const RichTextEditor = ({ value, onChange }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Code,
      CodeBlock,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Blockquote,
      HorizontalRule,
      ListItem,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[160px] border border-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border px-2 py-1 rounded-md bg-gray-50">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${
            editor.isActive("bold") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <Bold size={18} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${
            editor.isActive("italic") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <Italic size={18} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded ${
            editor.isActive("underline") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          U
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded ${
            editor.isActive("strike") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <Strikethrough size={18} />
        </button>

        {/* Code Inline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1 rounded ${
            editor.isActive("code") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <CodeIcon size={18} />
        </button>

        {/* Highlight */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1 rounded ${
            editor.isActive("highlight") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          H
        </button>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${
            editor.isActive("bulletList") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${
            editor.isActive("orderedList") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <ListOrdered size={18} />
        </button>

        {/* Text Align */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1 rounded ${
            editor.isActive({ textAlign: "left" })
              ? "bg-indigo-100 text-indigo-600"
              : ""
          }`}
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1 rounded ${
            editor.isActive({ textAlign: "center" })
              ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1 rounded ${
            editor.isActive({ textAlign: "right" })
              ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <AlignRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1 rounded ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <AlignJustify size={18} />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          className={`p-1 rounded ${
            editor.isActive("link") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <LinkIcon size={18} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded ${
            editor.isActive("blockquote") ? "bg-indigo-100 text-indigo-600" : ""
          }`}
        >
          <Quote size={18} />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1 rounded"
        >
          <Minus size={18} />
        </button>

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-1 rounded"
        >
          <Undo2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-1 rounded"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* Tailwind CSS for linked text */}
      <style jsx>{`
        .tiptap-editor a {
          @apply text-blue-600 underline;
        }
      `}</style>
    </div>
  );
};
