"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  "aria-label"?: string;
}

interface ToolbarItem {
  icon: typeof Bold;
  label: string;
  run: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const TOOLBAR: ToolbarItem[] = [
  {
    icon: Bold,
    label: "Tebal",
    run: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    icon: Italic,
    label: "Miring",
    run: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    icon: Heading2,
    label: "Judul 2",
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    icon: List,
    label: "Daftar berbutir",
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    icon: ListOrdered,
    label: "Daftar bernomor",
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    icon: Undo2,
    label: "Batalkan",
    run: (editor) => editor.chain().focus().undo().run(),
    isActive: () => false,
  },
  {
    icon: Redo2,
    label: "Ulangi",
    run: (editor) => editor.chain().focus().redo().run(),
    isActive: () => false,
  },
];

const EDITOR_CLASS =
  "min-h-48 w-full bg-background px-3 py-2.5 text-sm leading-relaxed outline-none " +
  "[&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_li]:my-0.5 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]";

/** Editor rich text (Tiptap) untuk draf artikel (R24). */
export function RichTextEditor({ value, onChange, ...rest }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    // Hindari render editor saat prerender (Next.js).
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
        "aria-label": rest["aria-label"] ?? "Isi artikel",
        "data-placeholder": "Tulis draf artikel di sini…",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  // Sinkronkan perubahan eksternal (mis. hasil regenerate) ke editor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const stats = useMemo(() => {
    const text = value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length };
  }, [value]);

  if (!editor) {
    return <div className="min-h-48 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="rounded-md border border-border">
      <div
        role="toolbar"
        aria-label="Format teks"
        className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1"
      >
        {TOOLBAR.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(editor);
          return (
            <button
              key={item.label}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => item.run(editor)}
              className={cn(
                "flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                active && "bg-background text-foreground shadow-xs"
              )}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          );
        })}
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-end gap-3 border-t border-border px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
        <span>{stats.words} kata</span>
        <span>{stats.chars} karakter</span>
      </div>
    </div>
  );
}
