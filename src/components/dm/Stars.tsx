import { Icons } from "./Icons";

interface StarsProps {
  value?: number;
  size?: number;
}

export default function Stars({ value = 5, size = 14 }: StarsProps) {
  return (
    <span className="flex items-center" style={{ gap: 2, color: "var(--cyan)" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= value ? "var(--cyan)" : "var(--ghost)" }}>
          <Icons.star size={size} />
        </span>
      ))}
    </span>
  );
}
