export const tokens = {
  color: {
    background: "#F7F3ED",
    backgroundAlt: "#FBF8F4",
    canvas: "#16121D",
    surface: "rgba(255, 255, 255, 0.92)",
    surfaceMuted: "#F1ECE5",
    surfaceElevated: "#FFFDFC",
    surfaceDark: "#1E1828",
    text: "#1E1823",
    textMuted: "#5F5668",
    textSubtle: "#8E8498",
    accent: "#7B5CFA",
    accentHover: "#694BE3",
    accentSoft: "#EEE8FF",
    accentWarm: "#F3B483",
    border: "rgba(98, 79, 130, 0.12)",
    borderStrong: "rgba(76, 56, 109, 0.22)",
    success: "#1F8A63",
    successSoft: "#E6F6EF",
    warning: "#B26B14",
    warningSoft: "#FFF3E2",
    danger: "#C55357",
    dangerSoft: "#FCEBEC",
    info: "#2D65D7",
    infoSoft: "#EAF0FF",
    overlay: "rgba(17, 12, 27, 0.56)"
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
    xs: 10,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 36,
    pill: 999
  },
  elevation: {
    soft: "0 18px 50px rgba(27, 20, 40, 0.08)",
    medium: "0 24px 70px rgba(27, 20, 40, 0.12)",
    glow: "0 22px 80px rgba(123, 92, 250, 0.18)",
    inset: "inset 0 1px 0 rgba(255,255,255,0.7)"
  },
  motion: {
    quick: "140ms",
    base: "220ms",
    slow: "340ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  },
  typography: {
    display: {
      fontSize: "clamp(3.25rem, 8vw, 6.6rem)",
      lineHeight: 0.92,
      fontWeight: 760
    },
    headline: {
      fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
      lineHeight: 0.98,
      fontWeight: 720
    },
    title: {
      fontSize: "1.55rem",
      lineHeight: 1.08,
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
