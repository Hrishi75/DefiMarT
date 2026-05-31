import { SVGProps } from "react";

interface IconProps {
  size?: number;
  sw?: number;
  fill?: string;
}

function Ic({
  d,
  size = 18,
  sw = 1.7,
  fill = "none",
  vb = "0 0 24 24",
  children,
}: {
  d?: string;
  size?: number;
  sw?: number;
  fill?: string;
  vb?: string;
  children?: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill={fill}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export const Icons = {
  search: (p: IconProps) => (
    <Ic {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Ic>
  ),
  wallet: (p: IconProps) => (
    <Ic {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v0" />
      <rect x="3" y="7" width="18" height="12" rx="2.5" />
      <circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
    </Ic>
  ),
  bolt: (p: IconProps) => <Ic {...p}><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l1-8z" /></Ic>,
  shield: (p: IconProps) => (
    <Ic {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Ic>
  ),
  heart: (p: IconProps) => (
    <Ic {...p}>
      <path d="M12 20s-7-4.5-9.5-9C1 7.5 3 4.5 6.2 4.5 8.2 4.5 9.7 5.8 12 8c2.3-2.2 3.8-3.5 5.8-3.5C21 4.5 23 7.5 21.5 11 19 15.5 12 20 12 20z" />
    </Ic>
  ),
  eye: (p: IconProps) => (
    <Ic {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Ic>
  ),
  grid: (p: IconProps) => (
    <Ic {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Ic>
  ),
  list: (p: IconProps) => (
    <Ic {...p}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></Ic>
  ),
  sliders: (p: IconProps) => (
    <Ic {...p}>
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </Ic>
  ),
  arrowR: (p: IconProps) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Ic>,
  arrowUpR: (p: IconProps) => <Ic {...p}><path d="M7 17L17 7M9 7h8v8" /></Ic>,
  plus: (p: IconProps) => <Ic {...p}><path d="M12 5v14M5 12h14" /></Ic>,
  star: (p: IconProps) => (
    <Ic {...p} fill="currentColor" sw={0}>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
    </Ic>
  ),
  check: (p: IconProps) => <Ic {...p}><path d="M4 12l5 5L20 6" /></Ic>,
  chevD: (p: IconProps) => <Ic {...p}><path d="M6 9l6 6 6-6" /></Ic>,
  share: (p: IconProps) => (
    <Ic {...p}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
    </Ic>
  ),
  lock: (p: IconProps) => (
    <Ic {...p}>
      <rect x="4.5" y="11" width="15" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Ic>
  ),
  globe: (p: IconProps) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </Ic>
  ),
  close: (p: IconProps) => <Ic {...p}><path d="M6 6l12 12M18 6L6 18" /></Ic>,
  menu: (p: IconProps) => <Ic {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Ic>,
  pin: (p: IconProps) => (
    <Ic {...p}>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Ic>
  ),
  tag: (p: IconProps) => (
    <Ic {...p}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l8 8-9 9-8-8z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </Ic>
  ),
  truck: (p: IconProps) => (
    <Ic {...p}>
      <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </Ic>
  ),
  msg: (p: IconProps) => <Ic {...p}><path d="M4 5h16v11H8l-4 4V5z" /></Ic>,
  spark: (p: IconProps) => (
    <Ic {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></Ic>
  ),
  refresh: (p: IconProps) => (
    <Ic {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></Ic>
  ),
};

export type IconName = keyof typeof Icons;
