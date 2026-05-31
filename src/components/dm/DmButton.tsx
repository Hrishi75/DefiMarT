import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

interface DmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: 40, padding: "0 18px", fontSize: 14 },
  md: { height: 48, padding: "0 24px", fontSize: 15 },
  lg: { height: 54, padding: "0 30px", fontSize: 16 },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--grad)",
    color: "#0a0710",
    fontWeight: 700,
    boxShadow: "0 8px 30px -8px rgba(155,92,255,0.55)",
  },
  ghost: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--text)",
  },
  dark: {
    background: "var(--bg-2)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--text)",
  },
};

export default function DmButton({
  variant = "primary",
  size = "md",
  children,
  style,
  ...props
}: DmButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        borderRadius: 999,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "transform .2s ease, box-shadow .3s ease, background .2s ease",
        position: "relative",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.boxShadow = "0 12px 40px -8px rgba(155,92,255,0.7)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
        if (variant === "ghost") e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        if (variant === "dark") e.currentTarget.style.background = "var(--bg-3)";
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.boxShadow = "0 8px 30px -8px rgba(155,92,255,0.55)";
          e.currentTarget.style.transform = "translateY(0)";
        }
        if (variant === "ghost") e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        if (variant === "dark") e.currentTarget.style.background = "var(--bg-2)";
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(1px)";
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        props.onMouseUp?.(e);
      }}
    >
      {children}
    </button>
  );
}
