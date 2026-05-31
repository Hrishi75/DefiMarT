interface ArtTileProps {
  hue?: number;
  glyph?: string;
  label?: string;
  big?: boolean;
  style?: React.CSSProperties;
}

export default function ArtTile({ hue = 270, glyph = "◆", label, big = false, style = {} }: ArtTileProps) {
  const h2 = (hue + 60) % 360;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: `radial-gradient(120% 120% at 30% 20%, hsl(${hue} 80% 22%), #0a0810 70%)`,
        ...style,
      }}
    >
      {/* drifting glow */}
      <div
        style={{
          position: "absolute",
          width: "75%",
          height: "75%",
          left: "12%",
          top: "16%",
          borderRadius: "50%",
          background: `conic-gradient(from 120deg, hsl(${hue} 90% 60%), hsl(${h2} 90% 62%), hsl(${hue} 90% 60%))`,
          filter: "blur(34px)",
          opacity: 0.5,
          animation: "dm-spin-slow 22s linear infinite",
        }}
      />
      {/* concentric rings */}
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
        {[78, 60, 42, 24].map((r, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={`hsla(${hue + i * 16} 90% 70% / ${0.5 - i * 0.07})`}
            strokeWidth="1"
          />
        ))}
      </svg>
      {/* glyph */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: big ? 132 : 66,
          color: "#fff",
          textShadow: `0 0 40px hsl(${hue} 90% 60%)`,
          opacity: 0.92,
        }}
      >
        {glyph}
      </div>
      {label && (
        <div
          className="dm-mono"
          style={{
            position: "absolute",
            left: 14,
            bottom: 12,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
