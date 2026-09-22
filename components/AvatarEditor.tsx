"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveAvatar } from "@/app/actions/avatar";
import { EMOJIS } from "@/lib/profile";

export default function AvatarEditor() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"photo" | "emoji">("photo");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  function save(kind: "emoji" | "default", value = "") {
    setError(""); setMessage("");
    startTransition(async () => {
      try { await saveAvatar(kind, value); setMessage("Profile picture saved."); router.refresh(); }
      catch (err) { setError(err instanceof Error ? err.message : "Could not save avatar."); }
    });
  }
  function upload(file?: File) {
    if (!file) return;
    setError(""); setMessage("");
    const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    if (!extensions[file.type] || file.size > 2 * 1024 * 1024 || file.size === 0) { setError("Choose a JPG, PNG or WebP image under 2 MB."); return; }
    startTransition(async () => {
      const supabase = createClient();
      let uploadedPath: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in again.");
        // Check the file can actually be decoded as an image before uploading.
        const bitmap = await createImageBitmap(file);
        bitmap.close();
        const path = `${user.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error("Upload failed. Please try again.");
        uploadedPath = path;
        await saveAvatar("photo", path);
        uploadedPath = null;
        setMessage("Photo saved."); router.refresh();
      } catch (err) {
        if (uploadedPath) await supabase.storage.from("avatars").remove([uploadedPath]);
        setError(err instanceof Error ? err.message : "Could not upload photo.");
      }
    });
  }
  return <div className="space-y-3">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="min-h-11 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300">Edit profile picture</button>
    {open && <fieldset disabled={pending} className="space-y-3 rounded-xl border border-zinc-800 p-3">
      <div className="flex gap-2">{(["photo", "emoji"] as const).map((option) => <button type="button" key={option} aria-pressed={mode === option} onClick={() => setMode(option)} className={`min-h-11 rounded-lg px-3 text-sm ${mode === option ? "bg-indigo-400/15 text-indigo-200" : "text-zinc-400"}`}>{option === "photo" ? "Upload photo" : "Choose emoji"}</button>)}</div>
      {mode === "photo" ? <label className="block space-y-2 text-xs text-zinc-400"><span>JPG, PNG or WebP · up to 2 MB</span><input aria-label="Upload profile photo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full min-w-0 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-800 file:p-2 file:text-zinc-200" onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ""; }} /></label> : <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{EMOJIS.map((emoji) => <button key={emoji} type="button" aria-label={`Use ${emoji} as avatar`} onClick={() => save("emoji", emoji)} className="flex h-11 items-center justify-center rounded-full bg-zinc-800 text-2xl">{emoji}</button>)}</div>}
      <button type="button" onClick={() => save("default")} className="min-h-11 text-sm text-zinc-400">Remove picture · use initials</button>
      <p className="text-xs text-zinc-500">Picture changes save immediately.</p>
    </fieldset>}
    {pending && <p role="status" className="text-sm text-zinc-400">Saving picture…</p>}
    {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
  </div>;
}
