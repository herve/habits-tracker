export const AVATARS = [
  { id: "initials", label: "Initials", symbol: "" },
  { id: "sun", label: "Sun", symbol: "☀" },
  { id: "moon", label: "Moon", symbol: "☾" },
  { id: "star", label: "Star", symbol: "★" },
  { id: "flower", label: "Flower", symbol: "✿" },
] as const;

export const EMOJIS = ["😀", "😎", "🥰", "🦊", "🐱", "🐶", "🐼", "🦁", "🌻", "🌈", "⭐", "🌙", "🚀", "🌱", "🏃", "🎯"] as const;

export function readProfile(metadata: Record<string, unknown>) {
  return {
    displayName: typeof metadata.display_name === "string" ? metadata.display_name : "",
    avatar: AVATARS.some((avatar) => avatar.id === metadata.profile_avatar) ? metadata.profile_avatar as string : "initials",
    showMotivation: metadata.show_motivation !== false,
    expandRestDays: metadata.expand_rest_days === true,
    avatarKind: metadata.avatar_kind === "photo" || metadata.avatar_kind === "emoji" ? metadata.avatar_kind : "default",
    avatarUrl: typeof metadata.avatar_url === "string" && metadata.avatar_url.startsWith("https://") ? metadata.avatar_url : "",
    avatarEmoji: EMOJIS.includes(metadata.avatar_emoji as typeof EMOJIS[number]) ? metadata.avatar_emoji as string : "",
  };
}

export function validateProfile(input: ReturnType<typeof readProfile>) {
  if (typeof input.displayName !== "string" || input.displayName.trim().length > 60) throw new Error("Use a display name of 60 characters or fewer.");
  if (!AVATARS.some((avatar) => avatar.id === input.avatar)) throw new Error("Choose a valid avatar.");
  if (typeof input.showMotivation !== "boolean" || typeof input.expandRestDays !== "boolean") throw new Error("Invalid preferences.");
  return { ...input, displayName: input.displayName.trim() };
}
