import { useAppContext } from '../../context/AppContext'
import type { Category } from '../../types'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'toilet', label: 'Toilets', emoji: '🚻' },
  { value: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { value: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
]

export default function CategoryFilter() {
  const { state, dispatch } = useAppContext()

  return (
    <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-1.5">
      {CATEGORIES.map(({ value, label, emoji }) => {
        const active = state.activeCategory === value
        return (
          <button
            key={value}
            onClick={() =>
              dispatch({ type: 'SET_CATEGORY', category: active ? null : value })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              active
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{emoji}</span>
            <span className="hidden xs:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
