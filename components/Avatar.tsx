"use client";

import Image from "next/image";
import { useState } from "react";
import { AVATARS, type readProfile } from "@/lib/profile";

export default function Avatar({ profile, email = "", small = false }: { profile: ReturnType<typeof readProfile>; email?: string; small?: boolean }) {
  const [failedUrl, setFailedUrl] = useState("");
  const initials = (profile.displayName.trim() || email || "You").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const photo = profile.avatarKind === "photo" && profile.avatarUrl && failedUrl !== profile.avatarUrl;
  const fallback = profile.avatarKind === "emoji" ? profile.avatarEmoji : AVATARS.find((avatar) => avatar.id === profile.avatar)?.symbol;
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-400/15 text-indigo-200 ${small ? "h-6 w-6 text-sm" : "h-16 w-16 text-3xl"}`}>
    {photo ? <Image src={profile.avatarUrl} alt="Profile picture" fill unoptimized sizes={small ? "24px" : "64px"} className="object-cover" onError={() => setFailedUrl(profile.avatarUrl)} /> : <span role="img" aria-label="Profile avatar">{fallback || initials}</span>}
  </span>;
}
