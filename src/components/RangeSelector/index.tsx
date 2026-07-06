import { useAppContext } from '../../context/AppContext'
import type { RangeMetres } from '../../types'

const RANGES: { value: RangeMetres; label: string }[] = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
]

export default function RangeSelector() {
  const { state, dispatch } = useAppContext()

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Within
      </span>
      <div className="flex gap-1">
        {RANGES.map(({ value, label }) => {
          const active = state.range === value
          return (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SET_RANGE', range: value })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
