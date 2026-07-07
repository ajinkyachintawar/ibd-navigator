import { useState } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import type { Category, UserLocation } from '../../types'
import { isWithinIreland } from '../../hooks/useCommunityPlaces'
import { PIN_COLOUR, PIN_TINT } from './placeMeta'
import type { User } from '@supabase/supabase-js'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'toilet',     label: 'Toilets' },
  { value: 'pharmacy',   label: 'Pharmacies' },
  { value: 'hospital',   label: 'Hospitals' },
  { value: 'restaurant', label: 'Restaurants' },
]

const pinIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:#005c4a;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
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
  const [notes, setNotes] = useState('')
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
      details: notes.trim() || null,
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
          {/* No backdrop — user must be able to drag the pin on the map above the sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[3000] bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-2xl shadow-2xl p-6 max-w-lg mx-auto"
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold">Add a place</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[85%]">
                  Help other patients — shared with the community after a quick review.
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0">✕</button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 mt-3">
              Drag the pin on the map to the exact location
            </p>

            {/* Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(({ value, label }) => {
                const active = category === value
                return (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    style={active ? { background: PIN_TINT[value], color: PIN_COLOUR[value] } : undefined}
                    className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
                      active ? '' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Name */}
            <input
              type="text"
              placeholder="Place name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl px-4 py-3 text-sm mb-3 outline-none focus:border-brand-500"
            />

            {/* Notes */}
            <textarea
              placeholder="Notes (accessibility, code needed, cleanliness...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl px-4 py-3 text-sm mb-5 outline-none focus:border-brand-500 resize-none"
            />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-green-800 text-white font-bold text-sm disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Submit to community map'}
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
