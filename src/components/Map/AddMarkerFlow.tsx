import { useState } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import type { Category, UserLocation } from '../../types'
import { isWithinIreland } from '../../hooks/useCommunityPlaces'
import type { User } from '@supabase/supabase-js'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'toilet',     label: 'Toilet',     emoji: '🚻' },
  { value: 'pharmacy',   label: 'Pharmacy',   emoji: '💊' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
]

const pinIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#6c3fc5;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

interface Props {
  user: User
  userLocation: UserLocation | null
  onClose: () => void
  onAdded: () => void
}

function DraggablePin({ position, onMove }: { position: [number, number]; onMove: (lat: number, lon: number) => void }) {
  return (
    <Marker
      position={position}
      icon={pinIcon}
      draggable
      eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onMove(p.lat, p.lng) } }}
    />
  )
}

export default function AddMarkerFlow({ user, userLocation, onClose, onAdded }: Props) {
  const start: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [53.4, -8.0]

  const [position, setPosition] = useState<[number, number]>(start)
  const [category, setCategory] = useState<Category>('toilet')
  const [name, setName] = useState('')
  const [wheelchair, setWheelchair] = useState(false)
  const [fee, setFee] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const [lat, lon] = position

    if (!isWithinIreland(lat, lon)) {
      setError('Marker must be within Ireland')
      return
    }

    setSaving(true)
    setError(null)

    const { error: dbError } = await supabase.from('markers').insert({
      category,
      lat,
      lon,
      name: name.trim() || null,
      wheelchair,
      fee,
      source: 'community',
      user_id: user.id,
    })

    setSaving(false)

    if (dbError) {
      setError('Failed to save. Please try again.')
      return
    }

    onAdded()
    onClose()
  }

  return (
    <>
      {/* Draggable pin on the map */}
      <DraggablePin position={position} onMove={(lat, lon) => setPosition([lat, lon])} />

      {/* Form bottom sheet */}
      {createPortal(
        <>
          <div className="fixed inset-0 bg-black/20 z-[3000]" onClick={onClose} />
          <div className="fixed bottom-0 left-0 right-0 z-[3001] bg-white rounded-t-2xl shadow-2xl p-6 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Add a place</h2>
              <button onClick={onClose} className="text-gray-400 text-lg font-bold px-2">✕</button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Drag the purple pin on the map to the exact location
            </p>

            {/* Category */}
            <div className="flex gap-2 mb-4">
              {CATEGORIES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    category === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>

            {/* Name */}
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:border-purple-400"
            />

            {/* Toggles */}
            <div className="flex gap-3 mb-5">
              {[
                { label: '♿ Accessible', value: wheelchair, set: setWheelchair },
                { label: '💰 Fee', value: fee, set: setFee },
              ].map(({ label, value, set }) => (
                <button
                  key={label}
                  onClick={() => set(!value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    value ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Add to Map'}
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
