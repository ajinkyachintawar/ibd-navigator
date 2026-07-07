interface Props {
  message: string | null
}

// Top-center pill, matches the design spec — mobile/tablet sits below the
// floating search overlay, desktop sits near the top since there's no overlay there.
export default function Toast({ message }: Props) {
  if (!message) return null

  return (
    <div
      className="fixed top-16 xl:top-5 left-1/2 -translate-x-1/2 z-[10000] bg-gray-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none"
      style={{ animation: 'fadeIn 0.15s ease' }}
    >
      {message}
    </div>
  )
}
