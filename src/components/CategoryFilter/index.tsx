import { useAppContext } from '../../context/AppContext'
import type { CategorySelection } from '../../types'

const ITEMS: { value: CategorySelection; label: string; color: string }[] = [
  { value: 'all',        label: 'All',         color: '#0f766e' },
  { value: 'toilet',     label: 'Toilets',     color: '#15803d' },
  { value: 'pharmacy',   label: 'Pharmacies',  color: '#7c3aed' },
  { value: 'hospital',   label: 'Hospitals',   color: '#2563eb' },
  { value: 'restaurant', label: 'Restaurants', color: '#c2410c' },
]

export default function CategoryFilter() {
  const { state, dispatch } = useAppContext()

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
      {ITEMS.map(({ value, label, color }) => {
        const active = state.activeCategory === value
        return (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SET_CATEGORY', category: value })}
            style={
              active
                ? { background: color, borderColor: color, color: '#fff' }
                : { borderColor: color, color }
            }
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border-2 bg-white/85 dark:bg-gray-900/70 backdrop-blur shadow-sm transition-all active:scale-95"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
