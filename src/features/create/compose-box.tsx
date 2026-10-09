"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CreateFlow } from "./use-create-flow";
import { hostOf } from "./link-utils";

interface ComposeBoxProps {
  flow: CreateFlow;
}

/**
 * Message box ala Lovable — tempat user menulis topik, mengunggah gambar, dan
 * menambahkan link referensi sebelum submit.
 */
export function ComposeBox({ flow }: ComposeBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const hasAttachments = flow.images.length > 0 || flow.links.length > 0;

  const growTextarea = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  };

  // Ketinggian mengikuti nilai (termasuk saat diisi dari pil topik).
  useEffect(() => {
    growTextarea(textareaRef.current);
  }, [flow.customDraft]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      flow.submit();
    }
  };

  const handleLinkSubmit = () => {
    if (!linkDraft.trim()) return;
    flow.addLink(linkDraft);
    setLinkDraft("");
    setLinkOpen(false);
  };

  return (
    <div className="rounded-3xl border border-black/5 bg-white/75 p-3 shadow-[0_18px_50px_-12px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) flow.addImages(files);
          event.target.value = "";
        }}
      />

      {hasAttachments && (
        <div className="mb-2 flex flex-wrap gap-2">
          {flow.images.map((image) => (
            <span
              key={image.id}
              className="group relative flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1 pr-8"
            >
              {image.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.previewUrl}
                  alt={image.name}
                  className="size-10 rounded-lg object-cover"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-[10px] font-medium">
                  IMG
                </span>
              )}
              <span className="max-w-40 truncate text-xs text-muted-foreground">
                {image.name}
              </span>
              <button
                type="button"
                aria-label={`Hapus gambar ${image.name}`}
                onClick={() => flow.removeImage(image.id)}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-neutral-800/70 text-white transition hover:bg-neutral-800"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {flow.links.map((url) => (
            <span
              key={url}
              className="relative flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-2.5 pr-7 text-xs text-foreground"
            >
              <Link2 className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="max-w-52 truncate">{hostOf(url)}</span>
              <button
                type="button"
                aria-label={`Hapus link ${url}`}
                onClick={() => flow.removeLink(url)}
                className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-neutral-800/10 hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <label htmlFor="compose-topic" className="sr-only">
        Topik konten
      </label>
      <Textarea
        id="compose-topic"
        ref={textareaRef}
        value={flow.customDraft}
        onChange={(event) => {
          flow.setCustomDraft(event.target.value);
          growTextarea(event.currentTarget);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Tulis topik yang ingin dibuat… misalnya “Tips aman bepergian saat musim hujan”"
        rows={2}
        aria-label="Topik konten"
        className="max-h-56 min-h-16 resize-none border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />

      {linkOpen && (
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleLinkSubmit();
              }
            }}
            placeholder="https://example.com/artikel"
            aria-label="Link referensi"
            autoFocus
            className="h-8 flex-1"
          />
          <Button type="button" size="sm" onClick={handleLinkSubmit}>
            Tambah
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setLinkOpen(false);
              setLinkDraft("");
            }}
          >
            Batal
          </Button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/70 pt-2">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tambah lampiran"
                className="rounded-full"
              >
                <span className="relative flex size-4 items-center justify-center">
                  <span className="absolute h-px w-3 bg-current" />
                  <span className="absolute h-3 w-px bg-current" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem
                onSelect={() => {
                  fileInputRef.current?.click();
                }}
              >
                <ImagePlus aria-hidden />
                Upload gambar
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setLinkOpen(true);
                }}
              >
                <Link2 aria-hidden />
                Tambah link referensi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="hidden text-xs text-muted-foreground sm:block">
            {flow.images.length > 0 || flow.links.length > 0
              ? `${flow.images.length} gambar · ${flow.links.length} link`
              : "Lampirkan gambar atau link referensi (opsional)"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {flow.draftMatchesSelection
              ? "Tekan Enter untuk ke pilihan angle"
              : flow.canSubmit
                ? "Enter untuk kirim"
                : "Minimal 4 karakter"}
          </span>
          <Button
            type="button"
            size="icon-lg"
            onClick={flow.submit}
            disabled={!flow.canSubmit}
            aria-label="Kirim topik"
            className="rounded-full bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-400 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/85 dark:disabled:bg-neutral-600"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
