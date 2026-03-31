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
      return { padding: "10px 14px", fontSize: "0.85rem" };
    case "lg":
      return { padding: "16px 22px", fontSize: "1rem" };
    default:
      return { padding: "13px 18px", fontSize: "0.92rem" };
  }
}

function buttonVariant(variant: ButtonVariant): CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        background: tokens.color.surface,
        color: tokens.color.text,
        border: `1px solid ${tokens.color.border}`
      };
    case "ghost":
      return {
        background: "transparent",
        color: tokens.color.text,
        border: "1px solid transparent"
      };
    case "danger":
      return {
        background: tokens.color.danger,
        color: "#FFFFFF",
        border: `1px solid ${tokens.color.danger}`
      };
    default:
      return {
        background: tokens.color.accent,
        color: "#FFFFFF",
        border: `1px solid ${tokens.color.accent}`
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
        borderRadius: tokens.radius.md,
        fontWeight: 650,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        boxShadow: variant === "primary" ? tokens.elevation.glow : "none",
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
        borderRadius: tokens.radius.sm,
        border: `1px solid ${tokens.color.border}`,
        background: tokens.color.surface,
        color: tokens.color.text,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: transition(),
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
      background: tokens.color.accentSoft,
      color: tokens.color.text,
      border: "1px solid rgba(99, 91, 255, 0.16)"
    },
    dark: {
      background: "#171326",
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
        padding: "6px 10px",
        borderRadius: tokens.radius.pill,
        fontSize: "0.76rem",
        fontWeight: 650,
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
        fontSize: "0.82rem",
        fontWeight: 600,
        background: active ? tokens.color.accentSoft : tokens.color.surfaceMuted,
        color: active ? tokens.color.accent : tokens.color.textMuted,
        border: `1px solid ${active ? "rgba(99, 91, 255, 0.18)" : tokens.color.border}`
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
          color: tokens.color.text
        }}
      >
        {label}
      </span>
      {children}
      {error ? (
        <span style={{ color: tokens.color.danger, fontSize: "0.8rem" }}>
          {error}
        </span>
      ) : hint ? (
        <span style={{ color: tokens.color.textSubtle, fontSize: "0.8rem" }}>
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
  background: tokens.color.surface,
  color: tokens.color.text,
  padding: "14px 16px",
  fontSize: "0.95rem"
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
        background: tokens.color.surface,
        padding: "14px 16px",
        cursor: "pointer"
      }}
    >
      <span style={{ display: "grid", gap: 4, textAlign: "left" }}>
        <span style={{ fontWeight: 650, color: tokens.color.text }}>{label}</span>
        {description ? (
          <span style={{ color: tokens.color.textMuted, fontSize: "0.85rem" }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        style={{
          width: 48,
          height: 28,
          borderRadius: tokens.radius.pill,
          background: checked ? tokens.color.accent : tokens.color.borderStrong,
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start"
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: tokens.radius.pill,
            background: "#FFFFFF"
          }}
        />
      </span>
    </button>
  );
}

export function SectionShell({
  title,
  eyebrow,
  actions,
  children
}: PropsWithChildren<{
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}>) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          {eyebrow ? (
            <span
              style={{
                fontSize: "0.76rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: tokens.color.accent
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
              fontWeight: tokens.typography.title.fontWeight
            }}
          >
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {children}
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
      background: tokens.color.surfaceMuted,
      color: tokens.color.textMuted
    },
    loading: {
      background: tokens.color.infoSoft,
      color: tokens.color.info
    },
    error: {
      background: tokens.color.dangerSoft,
      color: tokens.color.danger
    }
  };

  return (
    <div
      style={{
        borderRadius: tokens.radius.lg,
        padding: 24,
        display: "grid",
        gap: 12,
        ...tones[kind]
      }}
    >
      <strong style={{ fontSize: "1rem" }}>{title}</strong>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{description}</p>
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
          width: "min(100%, 720px)",
          borderRadius: `${tokens.radius.xl}px ${tokens.radius.xl}px 0 0`,
          background: tokens.color.surface,
          boxShadow: tokens.elevation.medium,
          padding: 24,
          display: "grid",
          gap: 16
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{title}</h3>
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
