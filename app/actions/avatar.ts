"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EMOJIS } from "@/lib/profile";

export async function saveAvatar(kind: "photo" | "emoji" | "default", value: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  let url: string | null = null;
  if (kind === "photo") {
    if (typeof value !== "string" || !value.startsWith(`${user.id}/`) || !/^[\da-f-]+\/[\da-f-]+\.(jpg|png|webp)$/.test(value)) throw new Error("Invalid photo path.");
    const filename = value.split("/")[1];
    const { data, error } = await supabase.storage.from("avatars").list(user.id, { search: filename });
    if (error || !data?.some((file) => file.name === filename)) throw new Error("Photo upload not found.");
    url = supabase.storage.from("avatars").getPublicUrl(value).data.publicUrl;
  } else if (kind === "emoji") {
    if (!EMOJIS.includes(value as typeof EMOJIS[number])) throw new Error("Choose an emoji from the picker.");
  } else if (kind !== "default") throw new Error("Invalid avatar type.");

  const oldPath = user.user_metadata.avatar_path;
  const { error } = await supabase.auth.updateUser({ data: {
    avatar_kind: kind, avatar_url: url, avatar_path: kind === "photo" ? value : null,
    avatar_emoji: kind === "emoji" ? value : null, profile_avatar: "initials",
  } });
  if (error) throw new Error("Could not save your picture. Please try again.");
  // Delete only a previous object belonging to this user, after saving the replacement.
  if (typeof oldPath === "string" && oldPath.startsWith(`${user.id}/`) && oldPath !== value) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }
  revalidatePath("/", "layout");
}
