"use client";

import { useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

interface Props {
  bucket: string;
  folder: string;
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
}

type Mode = "upload" | "url";

export default function ImageUpload({ bucket, folder, value, onChange, label = "Image" }: Props) {
  const [mode, setMode] = useState<Mode>("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }

    setError(null);
    setUploading(true);

    const supabase = createBrowserSupabaseClient()!;
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUrlInput(data.publicUrl);
    setUploading(false);
  }

  function handleFiles(files: FileList | null) {
    if (files && files[0]) upload(files[0]);
  }

  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) { setError("Please enter a URL."); return; }
    setError(null);
    onChange(trimmed);
  }

  return (
    <div className="space-y-2">
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 w-fit">
        {(["upload", "url"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={`rounded-md px-3 py-1 text-xs font-bold transition ${
              mode === m ? "bg-white text-brand-navy shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {m === "upload" ? "Upload file" : "Image URL"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition
              ${dragOver ? "border-brand-navy bg-brand-navy/5" : "border-gray-200 bg-gray-50 hover:border-brand-navy/50 hover:bg-gray-100"}`}
          >
            {value ? (
              <img src={value} alt={label} className="h-32 w-full rounded-lg object-cover" />
            ) : (
              <>
                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10l-4-4-4 4M12 6v10" />
                </svg>
                <p className="text-xs font-medium text-gray-400">
                  {uploading ? "Uploading…" : "Drop image here or click to upload"}
                </p>
                <p className="text-[11px] text-gray-300">PNG, JPG, WEBP — max 5 MB</p>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
              </div>
            )}
          </div>

          {value && (
            <div className="flex gap-2">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                Change
              </button>
              <button type="button" onClick={() => { onChange(""); setUrlInput(""); }}
                className="flex-1 rounded-lg border border-red-100 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                Remove
              </button>
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />
        </>
      ) : (
        <>
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://scontent.facebook.com/..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-base md:text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="w-full rounded-xl bg-brand-navy py-2 text-xs font-bold text-white hover:bg-brand-navy/90 transition"
            >
              Use this URL
            </button>
          </div>

          {value && (
            <div className="space-y-2">
              <img src={value} alt={label} className="h-32 w-full rounded-lg object-cover border border-gray-100" />
              <button type="button" onClick={() => { onChange(""); setUrlInput(""); }}
                className="w-full rounded-lg border border-red-100 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                Remove
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
