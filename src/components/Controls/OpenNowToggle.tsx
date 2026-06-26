import { useAppContext } from '../../context/AppContext'

export default function OpenNowToggle() {
  const { state, dispatch } = useAppContext()

  if (!state.activeCategory) return null

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_OPEN_NOW' })}
      className={`px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all border ${
        state.openNowOnly
          ? 'bg-green-600 text-white border-green-600'
          : 'bg-white/90 text-gray-500 border-gray-200 hover:bg-gray-50'
      }`}
      aria-pressed={state.openNowOnly}
    >
      🕐 Open Now
    </button>
  )
}
