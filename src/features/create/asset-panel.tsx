"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hostOf } from "./link-utils";
import type { CreateFlow } from "./use-create-flow";

interface AssetPanelProps {
  flow: CreateFlow;
}

/**
 * Panel "Aset & referensi" di halaman angle — menambah/menghapus gambar dan
 * link referensi setelah topik dikirim. Perubahan aset otomatis me-regenerate
 * opsi angle (query key menyertakan jumlah gambar & link).
 */
export function AssetPanel({ flow }: AssetPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkDraft, setLinkDraft] = useState("");

  const hasAttachments = flow.images.length > 0 || flow.links.length > 0;

  const handleAddLink = () => {
    if (!linkDraft.trim()) return;
    flow.addLink(linkDraft);
    setLinkDraft("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Aset &amp; referensi</h2>
          <p className="text-xs text-muted-foreground">
            Dilampirkan ke angle &amp; brief — bertambah atau berkurang, opsi
            angle diperbarui otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="size-3.5" aria-hidden />
            Upload gambar
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={linkDraft}
          onChange={(event) => setLinkDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddLink();
            }
          }}
          placeholder="Tambah link referensi… misalnya https://example.com/artikel"
          aria-label="Link referensi"
          className="h-8 flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddLink}
          disabled={!linkDraft.trim()}
        >
          <Plus className="size-3.5" aria-hidden />
          Tambah
        </Button>
      </div>

      {hasAttachments ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {flow.images.map((image) => (
            <span
              key={image.id}
              className="relative flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1 pr-8"
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
              <span className="max-w-44 truncate text-xs text-muted-foreground">
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
              <span className="max-w-56 truncate">{hostOf(url)}</span>
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
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
          Belum ada aset. Unggah gambar atau tambahkan link referensi agar
          angle lebih relevan.
        </p>
      )}
    </section>
  );
}
