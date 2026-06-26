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
    <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-1.5">
      {RANGES.map(({ value, label }) => {
        const active = state.range === value
        return (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SET_RANGE', range: value })}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              active
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
