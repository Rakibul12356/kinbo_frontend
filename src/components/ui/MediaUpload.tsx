"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { resolveAssetUrl } from "@/lib/axios";

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  const okType = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(
    file.type
  );
  if (!okType) return "Only JPEG, PNG, WEBP, and GIF images are allowed.";
  if (file.size > MAX_BYTES) return "Image size exceeds maximum limit of 5MB.";
  return null;
}

/** Single image: file upload and/or external URL. */
export function SingleImageUpload({
  label = "Image",
  url,
  onUrlChange,
  file,
  onFileChange,
  error,
}: {
  label?: string;
  url: string;
  onUrlChange: (url: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return url ? resolveAssetUrl(url) : "";
  }, [file, url]);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#1F2937]">{label}</p>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-zinc-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]">
            <Upload className="h-3.5 w-3.5" />
            Upload image
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const next = e.target.files?.[0] ?? null;
                if (!next) return;
                const err = validateImageFile(next);
                if (err) {
                  setLocalError(err);
                  onFileChange(null);
                  return;
                }
                setLocalError(null);
                onFileChange(next);
              }}
            />
          </label>
          {(file || url) && (
            <button
              type="button"
              onClick={() => {
                onFileChange(null);
                onUrlChange("");
                setLocalError(null);
              }}
              className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
          <input
            type="url"
            value={url}
            onChange={(e) => {
              onUrlChange(e.target.value);
              if (e.target.value.trim()) onFileChange(null);
            }}
            placeholder="Or paste image URL / CDN link"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
          />
          <p className="text-[11px] text-zinc-400">
            File upload preferred. Max 5MB · JPEG/PNG/WEBP/GIF.
          </p>
        </div>
      </div>
      {(localError || error) && (
        <p className="text-xs text-rose-500">{localError || error}</p>
      )}
    </div>
  );
}

/** Multiple product images (max 5). */
export function MultiImageUpload({
  files,
  onFilesChange,
  urlList,
  onUrlListChange,
  existingUrls = [],
  max = 5,
  error,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  urlList: string;
  onUrlListChange: (value: string) => void;
  existingUrls?: string[];
  max?: number;
  error?: string;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const previews = useMemo(
    () => files.map((file) => ({ key: `${file.name}-${file.size}`, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const remaining = max - files.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#1F2937]">Product images</p>
        <span className="text-[11px] text-zinc-400">
          {files.length}/{max} files · upload wins over URLs
        </span>
      </div>

      {existingUrls.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Current images
          </p>
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((src) => (
              <div
                key={src}
                className="h-16 w-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8FAFC]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveAssetUrl(src)} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {previews.map((preview, index) => (
          <div key={preview.key} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#E5E7EB]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white cursor-pointer"
              aria-label="Remove image"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-[#082F6B] px-1.5 py-0.5 text-[9px] font-bold text-white">
                Primary
              </span>
            )}
          </div>
        ))}
        {remaining > 0 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] text-[#082F6B] hover:bg-[#F3F7FC]">
            <Upload className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Add</span>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (picked.length === 0) return;
                const next: File[] = [...files];
                for (const file of picked) {
                  if (next.length >= max) break;
                  const err = validateImageFile(file);
                  if (err) {
                    setLocalError(err);
                    continue;
                  }
                  next.push(file);
                }
                if (next.length > files.length) setLocalError(null);
                onFilesChange(next);
              }}
            />
          </label>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
          Or image URLs (one per line)
        </label>
        <textarea
          rows={3}
          value={urlList}
          onChange={(e) => onUrlListChange(e.target.value)}
          placeholder={"https://cdn.example.com/1.jpg\nhttps://cdn.example.com/2.jpg"}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
        />
      </div>
      {(localError || error) && (
        <p className="text-xs text-rose-500">{localError || error}</p>
      )}
    </div>
  );
}

const RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const RESUME_MAX_BYTES = 10 * 1024 * 1024;

export function validateResumeFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const okExt = name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
  const okType =
    !file.type ||
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.type);
  if (!okExt || !okType) return "Resume must be a PDF or Word document.";
  if (file.size > RESUME_MAX_BYTES) return "Resume size exceeds maximum limit of 10MB.";
  return null;
}

/** Resume file upload with optional public URL fallback. */
export function ResumeUpload({
  file,
  onFileChange,
  url,
  onUrlChange,
  error,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  error?: string;
}) {
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#1F2937]">Resume</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]">
          <Upload className="h-3.5 w-3.5" />
          {file ? "Replace file" : "Upload resume"}
          <input
            type="file"
            accept={RESUME_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (!next) return;
              const err = validateResumeFile(next);
              if (err) {
                setLocalError(err);
                onFileChange(null);
                return;
              }
              setLocalError(null);
              onFileChange(next);
              onUrlChange("");
            }}
          />
        </label>
        {file && (
          <button
            type="button"
            onClick={() => {
              onFileChange(null);
              setLocalError(null);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Clear file
          </button>
        )}
      </div>
      {file && <p className="truncate text-xs text-zinc-500">{file.name}</p>}
      <input
        type="url"
        value={url}
        onChange={(e) => {
          onUrlChange(e.target.value);
          if (e.target.value.trim()) onFileChange(null);
        }}
        placeholder="Or paste a public resume URL"
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
      />
      <p className="text-[11px] text-zinc-400">PDF or Word · max 10MB. File upload preferred.</p>
      {(localError || error) && (
        <p className="text-xs text-rose-500">{localError || error}</p>
      )}
    </div>
  );
}
