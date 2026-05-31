import { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  pill?: boolean;
  children: ReactNode;
}

export default function Chip({ active = false, pill = false, children, style, ...props }: ChipProps) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 34,
        padding: "0 14px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: props.onClick ? "pointer" : "default",
        transition: "all .2s ease",
        border: "none",
        fontFamily: "inherit",
        ...(pill
          ? {
              background: "var(--grad-soft)",
              border: "1px solid rgba(155,92,255,0.3)",
              color: "var(--text)",
            }
          : active
          ? {
              color: "var(--text)",
              background: "var(--grad-soft)",
              boxShadow: "inset 0 0 0 1px rgba(155,92,255,0.4)",
            }
          : {
              color: "var(--muted)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--line)",
            }),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
