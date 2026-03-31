export const tokens = {
  color: {
    background: "#F5F6FB",
    surface: "#FFFFFF",
    surfaceMuted: "#EEF1F8",
    surfaceElevated: "#FFFFFF",
    text: "#151922",
    textMuted: "#5D6575",
    textSubtle: "#7F8798",
    accent: "#635BFF",
    accentHover: "#5148E6",
    accentSoft: "#ECE9FF",
    border: "#D9DEE8",
    borderStrong: "#BCC5D6",
    success: "#0F9B6F",
    successSoft: "#E6F7F1",
    warning: "#B36A14",
    warningSoft: "#FFF2E1",
    danger: "#C9474D",
    dangerSoft: "#FCEBEC",
    info: "#246BCE",
    infoSoft: "#E8F1FF",
    overlay: "rgba(18, 24, 38, 0.48)"
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999
  },
  elevation: {
    soft: "0 14px 40px rgba(22, 28, 45, 0.08)",
    medium: "0 20px 60px rgba(22, 28, 45, 0.12)",
    glow: "0 22px 80px rgba(99, 91, 255, 0.16)"
  },
  motion: {
    quick: "140ms",
    base: "220ms",
    slow: "340ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  },
  typography: {
    display: {
      fontSize: "clamp(3rem, 8vw, 6rem)",
      lineHeight: 0.92,
      fontWeight: 780
    },
    headline: {
      fontSize: "clamp(2rem, 4vw, 3rem)",
      lineHeight: 1.02,
      fontWeight: 720
    },
    title: {
      fontSize: "1.5rem",
      lineHeight: 1.1,
      fontWeight: 700
    },
    body: {
      fontSize: "1rem",
      lineHeight: 1.65,
      fontWeight: 400
    },
    label: {
      fontSize: "0.9rem",
      lineHeight: 1.3,
      fontWeight: 600
    },
    caption: {
      fontSize: "0.78rem",
      lineHeight: 1.35,
      fontWeight: 500
    }
  }
} as const;

export const appShellCopy = {
  mobileTitle: "Museio Creator Shell",
  webTitle: "Museio Public Web",
  protectedShellTitle: "Museio Workspace"
} as const;
