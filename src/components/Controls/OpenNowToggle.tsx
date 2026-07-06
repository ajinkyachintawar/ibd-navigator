import { useAppContext } from '../../context/AppContext'

export default function OpenNowToggle() {
  const { state, dispatch } = useAppContext()

  if (!state.activeCategory) return null

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_OPEN_NOW' })}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
        state.openNowOnly
          ? 'bg-green-600 text-white border-green-600'
          : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
      }`}
      aria-pressed={state.openNowOnly}
    >
      🕐 Open Now
    </button>
  )
}
