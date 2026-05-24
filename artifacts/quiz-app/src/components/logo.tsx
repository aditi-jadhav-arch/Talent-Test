interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 36, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="36" height="36" rx="9" fill="#0d72d6" />
      <path
        d="M10 10h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"
        fill="rgba(255,255,255,.18)"
        stroke="rgba(255,255,255,.9)"
        strokeWidth="1.8"
      />
      <rect
        x="14" y="7" width="8" height="6" rx="2"
        fill="#0d72d6"
        stroke="rgba(255,255,255,.9)"
        strokeWidth="1.8"
      />
      <path
        d="M11.5 22l4 4 8-8"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
