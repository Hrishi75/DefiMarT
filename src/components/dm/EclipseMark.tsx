interface EclipseMarkProps {
  size?: number;
  animate?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function EclipseMark({ size = 34, animate = false, style, className }: EclipseMarkProps) {
  const gid = `eg${size}`;
  const mid = `em${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={{ flexShrink: 0, animation: animate ? "dm-spin-slow 28s linear infinite" : "none", ...style }}
    >
      <defs>
        <linearGradient id={gid} x1="20" y1="92" x2="82" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0"    stopColor="#34e6cf" />
          <stop offset="0.4"  stopColor="#4f86ff" />
          <stop offset="0.72" stopColor="#9b5cff" />
          <stop offset="1"    stopColor="#d24bff" />
        </linearGradient>
        <mask id={mid}>
          <rect width="100" height="100" fill="black" />
          <circle cx="50" cy="50" r="42" fill="white" />
          <circle cx="64" cy="42" r="33" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#${gid})`} mask={`url(#${mid})`} />
    </svg>
  );
}
