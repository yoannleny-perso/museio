import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { tokens } from "./tokens.js";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

function transition() {
  return `all ${tokens.motion.base} ${tokens.motion.easing}`;
}

function buttonSize(size: ButtonSize): CSSProperties {
  switch (size) {
    case "sm":
      return { padding: "10px 14px", fontSize: "0.82rem", minHeight: 40 };
    case "lg":
      return { padding: "16px 22px", fontSize: "0.98rem", minHeight: 56 };
    default:
      return { padding: "13px 18px", fontSize: "0.9rem", minHeight: 48 };
  }
}

function buttonVariant(variant: ButtonVariant): CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        background: "#FFFFFF",
        color: tokens.color.text,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.elevation.soft
      };
    case "ghost":
      return {
        background: "rgba(255,255,255,0.58)",
        color: tokens.color.textMuted,
        border: `1px solid ${tokens.color.border}`
      };
    case "danger":
      return {
        background: `linear-gradient(135deg, ${tokens.color.danger} 0%, #c64557 100%)`,
        color: "#FFFFFF",
        border: "1px solid transparent",
        boxShadow: "0 14px 32px rgba(197, 83, 87, 0.22)"
      };
    default:
      return {
        background: `linear-gradient(135deg, #8f6ee6 0%, ${tokens.color.accent} 100%)`,
        color: "#FFFFFF",
        border: "1px solid transparent",
        boxShadow: tokens.elevation.glow
      };
  }
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  style,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>) {
  return (
    <button
      {...props}
      style={{
        borderRadius: tokens.radius.pill,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: transition(),
        ...buttonSize(size),
        ...buttonVariant(variant),
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  style,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      {...props}
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        border: `1px solid ${tokens.color.border}`,
        background: "#FFFFFF",
        color: tokens.color.text,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: transition(),
        boxShadow: tokens.elevation.soft,
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  tone = "default",
  style
}: PropsWithChildren<{
  tone?: "default" | "muted" | "accent" | "dark";
  style?: CSSProperties;
}>) {
  const tones: Record<string, CSSProperties> = {
    default: {
      background: tokens.color.surface,
      color: tokens.color.text,
      border: `1px solid ${tokens.color.border}`
    },
    muted: {
      background: tokens.color.surfaceMuted,
      color: tokens.color.text,
      border: `1px solid ${tokens.color.border}`
    },
    accent: {
      background: "linear-gradient(135deg, #fbf8ff 0%, #f6f0ff 48%, #fffaf5 100%)",
      color: tokens.color.text,
      border: `1px solid ${tokens.color.borderStrong}`
    },
    dark: {
      background: `linear-gradient(160deg, ${tokens.color.canvas} 0%, #261d3f 100%)`,
      color: "#FFFFFF",
      border: "1px solid rgba(255,255,255,0.08)"
    }
  };

  return (
    <div
      style={{
        borderRadius: tokens.radius.lg,
        boxShadow: tokens.elevation.soft,
        padding: 24,
        overflow: "hidden",
        position: "relative",
        ...tones[tone],
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: PropsWithChildren<{ tone?: "neutral" | "success" | "warning" | "accent" }>) {
  const tones: Record<string, CSSProperties> = {
    neutral: {
      background: tokens.color.surfaceMuted,
      color: tokens.color.textMuted
    },
    success: {
      background: tokens.color.successSoft,
      color: tokens.color.success
    },
    warning: {
      background: tokens.color.warningSoft,
      color: tokens.color.warning
    },
    accent: {
      background: tokens.color.accentSoft,
      color: tokens.color.accent
    }
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: tokens.radius.pill,
        fontSize: "0.74rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...tones[tone]
      }}
    >
      {children}
    </span>
  );
}

export function Chip({
  children,
  active = false
}: PropsWithChildren<{ active?: boolean }>) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: tokens.radius.pill,
        fontSize: "0.8rem",
        fontWeight: 650,
        background: active ? tokens.color.accentSoft : "#FFFFFF",
        color: active ? tokens.color.accent : tokens.color.textMuted,
        border: `1px solid ${active ? "rgba(123, 92, 250, 0.18)" : tokens.color.border}`
      }}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children
}: PropsWithChildren<{
  label: string;
  hint?: string;
  error?: string;
}>) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span
        style={{
          fontSize: tokens.typography.label.fontSize,
          lineHeight: String(tokens.typography.label.lineHeight),
          fontWeight: tokens.typography.label.fontWeight,
          color: tokens.color.text,
          letterSpacing: "0.02em"
        }}
      >
        {label}
      </span>
      {children}
      {error ? (
        <span style={{ color: tokens.color.danger, fontSize: "0.8rem", lineHeight: 1.5 }}>{error}</span>
      ) : hint ? (
        <span style={{ color: tokens.color.textSubtle, fontSize: "0.8rem", lineHeight: 1.5 }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const sharedInputStyle: CSSProperties = {
  width: "100%",
  borderRadius: tokens.radius.md,
  border: `1px solid ${tokens.color.border}`,
  background: "rgba(255,255,255,0.96)",
  color: tokens.color.text,
  padding: "14px 16px",
  fontSize: "0.95rem",
  lineHeight: 1.5,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92), 0 8px 18px rgba(31, 36, 48, 0.04)",
  outline: "none"
};

export function TextInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    style?: CSSProperties;
  }
) {
  return <input {...props} style={{ ...sharedInputStyle, ...props.style }} />;
}

export function TextArea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    style?: CSSProperties;
  }
) {
  return (
    <textarea
      {...props}
      style={{
        ...sharedInputStyle,
        minHeight: 120,
        resize: "vertical",
        ...props.style
      }}
    />
  );
}

export function SelectField(
  props: SelectHTMLAttributes<HTMLSelectElement> & {
    style?: CSSProperties;
  }
) {
  return <select {...props} style={{ ...sharedInputStyle, ...props.style }} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  description
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.color.border}`,
        background: "#FFFFFF",
        padding: "16px 18px",
        cursor: "pointer",
        boxShadow: tokens.elevation.soft,
        transition: transition()
      }}
    >
      <span style={{ display: "grid", gap: 4, textAlign: "left" }}>
        <span style={{ fontWeight: 700, color: tokens.color.text }}>{label}</span>
        {description ? (
          <span style={{ color: tokens.color.textMuted, fontSize: "0.85rem", lineHeight: 1.5 }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        style={{
          width: 52,
          height: 30,
          borderRadius: tokens.radius.pill,
          background: checked ? tokens.color.accent : "#CFC6D9",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
          transition: transition()
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: tokens.radius.pill,
            background: "#FFFFFF",
            boxShadow: "0 6px 12px rgba(17, 12, 27, 0.18)"
          }}
        />
      </span>
    </button>
  );
}

export function SectionShell({
  title,
  eyebrow,
  description,
  actions,
  children
}: PropsWithChildren<{
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
}>) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "26px 26px 22px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          borderBottom: `1px solid ${tokens.color.border}`,
          background:
            "radial-gradient(circle at top right, rgba(255,179,138,0.16), transparent 28%), linear-gradient(180deg, rgba(244,238,253,0.9) 0%, rgba(255,255,255,0.98) 100%)"
        }}
      >
        <div style={{ display: "grid", gap: 8, maxWidth: 760 }}>
          {eyebrow ? (
            <span
              style={{
                fontSize: "0.74rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: tokens.color.accent,
                fontWeight: 700
              }}
            >
              {eyebrow}
            </span>
          ) : null}
          <h2
            style={{
              margin: 0,
              fontSize: tokens.typography.title.fontSize,
              lineHeight: String(tokens.typography.title.lineHeight),
              fontWeight: tokens.typography.title.fontWeight,
              letterSpacing: "-0.03em"
            }}
          >
            {title}
          </h2>
          {description ? (
            <div
              style={{
                color: tokens.color.textMuted,
                lineHeight: 1.7,
                fontSize: "0.96rem"
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
        {actions}
      </div>
      <div style={{ padding: 26, display: "grid", gap: 18 }}>{children}</div>
    </Card>
  );
}

export function StatePanel({
  kind,
  title,
  description,
  action
}: {
  kind: "empty" | "loading" | "error";
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const tones: Record<string, CSSProperties> = {
    empty: {
      background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, #f4ede6 100%)",
      color: tokens.color.textMuted
    },
    loading: {
      background: "linear-gradient(135deg, #eef3ff 0%, #fbf8ff 100%)",
      color: tokens.color.info
    },
    error: {
      background: "linear-gradient(135deg, #fff5f5 0%, #fcebec 100%)",
      color: tokens.color.danger
    }
  };

  return (
    <div
      style={{
        borderRadius: tokens.radius.lg,
        padding: 24,
        display: "grid",
        gap: 14,
        border: `1px solid ${tokens.color.border}`,
        boxShadow: tokens.elevation.soft,
        position: "relative",
        ...tones[kind]
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: tokens.radius.lg,
          background:
            kind === "loading"
              ? "radial-gradient(circle at top right, rgba(75,124,249,0.12), transparent 24%)"
              : kind === "error"
                ? "radial-gradient(circle at top right, rgba(216,93,104,0.1), transparent 24%)"
                : "radial-gradient(circle at top right, rgba(122,66,232,0.1), transparent 24%)",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          color: tokens.color.text,
          background: "rgba(255,255,255,0.88)",
          border: `1px solid ${tokens.color.border}`
        }}
      >
        {kind === "loading" ? "…" : kind === "error" ? "!" : "+"}
      </div>
      <strong style={{ fontSize: "1rem", color: tokens.color.text, position: "relative" }}>{title}</strong>
      <p style={{ margin: 0, lineHeight: 1.7, position: "relative" }}>{description}</p>
      {action}
    </div>
  );
}

export function Sheet({
  open,
  title,
  children,
  footer
}: PropsWithChildren<{
  open: boolean;
  title: string;
  footer?: ReactNode;
}>) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: tokens.color.overlay,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: 16,
        zIndex: 40
      }}
    >
      <div
        style={{
          width: "min(100%, 760px)",
          borderRadius: `${tokens.radius.xl}px ${tokens.radius.xl}px 0 0`,
          background: tokens.color.surfaceElevated,
          boxShadow: tokens.elevation.medium,
          padding: 24,
          display: "grid",
          gap: 16
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.2rem", letterSpacing: "-0.03em" }}>{title}</h3>
        <div>{children}</div>
        {footer ? <div>{footer}</div> : null}
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div
      style={{
        width: "100%",
        height: 1,
        background: tokens.color.border
      }}
    />
  );
}
