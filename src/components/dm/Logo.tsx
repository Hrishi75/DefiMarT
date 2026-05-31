import EclipseMark from "./EclipseMark";

interface LogoProps {
  size?: number;
  showWord?: boolean;
}

export default function Logo({ size = 34, showWord = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <EclipseMark size={size} />
      {showWord && (
        <span
          className="dm-display"
          style={{ fontSize: size * 0.62, fontWeight: 700, letterSpacing: "-0.04em" }}
        >
          DEFI<span className="dm-grad-text">MART</span>
        </span>
      )}
    </div>
  );
}
