import { useAppContext } from '../../context/AppContext'

export default function OpenNowToggle() {
  const { state, dispatch } = useAppContext()

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_OPEN_NOW' })}
      className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm backdrop-blur ${
        state.openNowOnly
          ? 'bg-green-600 text-white border-green-600'
          : 'bg-white/85 text-gray-500 border-transparent hover:bg-white dark:bg-gray-900/70 dark:text-gray-400'
      }`}
      aria-pressed={state.openNowOnly}
    >
      Open Now
    </button>
  )
}
