export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" className="fill-primary" />
      <rect
        x="11.5"
        y="11.5"
        width="17"
        height="17"
        rx="2.5"
        transform="rotate(45 20 20)"
        fill="#fff"
      />
      <circle cx="20" cy="20" r="4.4" className="fill-primary" />
    </svg>
  );
}

export default Logo;
