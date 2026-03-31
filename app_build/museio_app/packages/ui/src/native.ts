import { tokens } from "./tokens.js";

export const nativeTheme = {
  screen: {
    backgroundColor: tokens.color.background
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.lg
  },
  text: {
    color: tokens.color.text
  },
  textMuted: {
    color: tokens.color.textMuted
  },
  accent: {
    color: tokens.color.accent
  }
} as const;
