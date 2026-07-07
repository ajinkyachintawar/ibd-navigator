import { useAppContext } from '../../context/AppContext'
import { PIN_COLOUR } from '../Map/placeMeta'
import type { Category } from '../../types'

const ITEMS: { value: Category | 'all'; label: string; color: string }[] = [
  { value: 'all',        label: 'All',         color: '#005c4a' },
  { value: 'toilet',     label: 'Toilets',     color: PIN_COLOUR.toilet },
  { value: 'pharmacy',   label: 'Pharmacies',  color: PIN_COLOUR.pharmacy },
  { value: 'hospital',   label: 'Hospitals',   color: PIN_COLOUR.hospital },
  { value: 'restaurant', label: 'Restaurants', color: PIN_COLOUR.restaurant },
]

interface Props {
  // Sidebar has vertical room to spare — wrap chips onto multiple lines there
  // instead of horizontally scrolling a single row like the floating overlays do.
  wrap?: boolean
}

export default function CategoryFilter({ wrap = false }: Props) {
  const { state, dispatch } = useAppContext()
  const allActive = state.selectedTypes.length === 4

  return (
    <div className={wrap ? 'flex flex-wrap gap-2' : 'flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5'}>
      {ITEMS.map(({ value, label, color }) => {
        const active = value === 'all' ? allActive : state.selectedTypes.includes(value)
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
