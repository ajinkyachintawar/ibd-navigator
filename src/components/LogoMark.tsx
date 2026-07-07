interface Props {
  size?: number
  className?: string
}

// App logo — a map pin with a health-cross knockout, in the exact brand teal.
export default function LogoMark({ size = 30, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="#005c4a" />
      <path
        d="M50 82 C50 82, 24 46, 24 40 A26 26 0 1 1 76 40 C76 46, 50 82, 50 82 Z"
        fill="#ffffff"
      />
      <rect x="40" y="25" width="10" height="26" rx="3" fill="#005c4a" />
      <rect x="32" y="33" width="26" height="10" rx="3" fill="#005c4a" />
    </svg>
  )
}
