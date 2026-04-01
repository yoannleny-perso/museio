export const tokens = {
  color: {
    background: "#F8F9FB",
    backgroundAlt: "#F2F4F8",
    canvas: "#151421",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F6FA",
    surfaceElevated: "#FFFFFF",
    surfaceDark: "#1B1730",
    text: "#1F2430",
    textMuted: "#4F5868",
    textSubtle: "#7A7F8C",
    accent: "#7A42E8",
    accentHover: "#6731D6",
    accentSoft: "#F4EEFD",
    accentWarm: "#FFB38A",
    border: "rgba(221, 220, 231, 0.94)",
    borderStrong: "rgba(122, 66, 232, 0.18)",
    success: "#2F9D63",
    successSoft: "#EAF8F0",
    warning: "#C47B15",
    warningSoft: "#FFF4E4",
    danger: "#D85D68",
    dangerSoft: "#FFF0F3",
    info: "#4B7CF9",
    infoSoft: "#EEF3FF",
    overlay: "rgba(17, 20, 30, 0.52)"
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
  },
  radius: {
    xs: 12,
    sm: 18,
    md: 22,
    lg: 30,
    xl: 38,
    pill: 999
  },
  elevation: {
    soft: "0 16px 36px rgba(31, 36, 48, 0.08)",
    medium: "0 26px 70px rgba(31, 36, 48, 0.12)",
    glow: "0 20px 46px rgba(122, 66, 232, 0.24)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.92)"
  },
  motion: {
    quick: "140ms",
    base: "220ms",
    slow: "340ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  },
  typography: {
    display: {
      fontSize: "clamp(3.1rem, 8vw, 6rem)",
      lineHeight: 0.92,
      fontWeight: 760
    },
    headline: {
      fontSize: "clamp(2rem, 5vw, 3.25rem)",
      lineHeight: 0.98,
      fontWeight: 720
    },
    title: {
      fontSize: "1.45rem",
      lineHeight: 1.12,
      fontWeight: 720
    },
    body: {
      fontSize: "1rem",
      lineHeight: 1.7,
      fontWeight: 400
    },
    label: {
      fontSize: "0.82rem",
      lineHeight: 1.3,
      fontWeight: 650
    },
    caption: {
      fontSize: "0.76rem",
      lineHeight: 1.35,
      fontWeight: 600
    }
  }
} as const;

export const appShellCopy = {
  mobileTitle: "Museio Mobile",
  webTitle: "Museio Public Web",
  protectedShellTitle: "Museio Workspace"
} as const;
