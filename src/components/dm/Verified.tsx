import { Icons } from "./Icons";

interface VerifiedProps {
  size?: number;
}

export default function Verified({ size = 16 }: VerifiedProps) {
  return (
    <span
      title="On-chain verified"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--grad)",
        color: "#0a0710",
        flexShrink: 0,
      }}
    >
      <Icons.check size={size * 0.62} sw={3.2} />
    </span>
  );
}
