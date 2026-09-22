"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import { type readProfile } from "@/lib/profile";
import Avatar from "./Avatar";
import AvatarEditor from "./AvatarEditor";

export default function ProfileForm({ initial, email, joined }: { initial: ReturnType<typeof readProfile>; email: string; joined: string }) {
  const [profile, setProfile] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    startTransition(async () => {
      try { await updateProfile(profile); setMessage("Profile saved."); }
      catch (err) { setError(err instanceof Error ? err.message : "Could not save your profile."); }
    });
  }
  return <form onSubmit={save} className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
    <div className="mb-6 flex items-center gap-4">
      <Avatar profile={{ ...initial, displayName: profile.displayName }} email={email} />
      <div className="min-w-0"><h2 className="break-words text-lg font-medium text-zinc-100">{profile.displayName.trim() || "Your profile"}</h2><p className="break-all text-sm text-zinc-400">{email || "Email unavailable"}</p><p className="mt-1 text-xs text-zinc-500">Joined {joined}</p></div>
    </div>
    <fieldset disabled={pending} className="space-y-5">
      <AvatarEditor />
      <div><label htmlFor="display-name" className="mb-2 block text-sm text-zinc-300">Display name</label><input id="display-name" autoComplete="nickname" maxLength={60} value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} placeholder="Your name" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100" /></div>
      <fieldset className="space-y-3"><legend className="mb-2 text-sm font-medium text-zinc-300">Preferences</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={profile.showMotivation} onChange={(event) => setProfile({ ...profile, showMotivation: event.target.checked })} className="h-4 w-4 accent-indigo-400" />Show motivational messages</label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={profile.expandRestDays} onChange={(event) => setProfile({ ...profile, expandRestDays: event.target.checked })} className="h-4 w-4 accent-indigo-400" />Expand “Not today” by default</label>
      </fieldset>
      <button type="submit" className="min-h-11 w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50">{pending ? "Saving…" : "Save profile"}</button>
    </fieldset>
    {message && <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
  </form>;
}
