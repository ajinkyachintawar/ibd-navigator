import { useAppContext } from '../../context/AppContext'
import type { Category } from '../../types'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'toilet', label: 'Toilets', emoji: '🚻' },
  { value: 'pharmacy', label: 'Pharmacies', emoji: '💊' },
  { value: 'hospital', label: 'Hospitals', emoji: '🏥' },
  { value: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
]

export default function CategoryFilter() {
  const { state, dispatch } = useAppContext()

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
      {CATEGORIES.map(({ value, label, emoji }) => {
        const active = state.activeCategory === value
        return (
          <button
            key={value}
            onClick={() =>
              dispatch({ type: 'SET_CATEGORY', category: active ? null : value })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              active
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
