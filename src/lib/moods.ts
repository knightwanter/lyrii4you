import type { MoodTag } from "@/types";

export const MOODS: { key: MoodTag; label: string; emoji: string }[] = [
  { key: "melancholy", label: "Melancholy", emoji: "🌧" },
  { key: "joy", label: "Joy", emoji: "✨" },
  { key: "longing", label: "Longing", emoji: "🌙" },
  { key: "rage", label: "Rage", emoji: "🔥" },
  { key: "serenity", label: "Serenity", emoji: "🍃" },
  { key: "love", label: "Love", emoji: "❤️" },
  { key: "nostalgia", label: "Nostalgia", emoji: "📷" },
  { key: "hope", label: "Hope", emoji: "🌅" },
  { key: "grief", label: "Grief", emoji: "🕯" },
  { key: "wonder", label: "Wonder", emoji: "🌌" },
];

export const MOOD_BY_KEY: Record<string, { label: string; emoji: string }> = Object.fromEntries(
  MOODS.map((m) => [m.key, { label: m.label, emoji: m.emoji }])
);
