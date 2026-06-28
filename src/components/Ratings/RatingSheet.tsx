import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import type { Place } from '../../types'
import type { User } from '@supabase/supabase-js'

interface Props {
  place: Place
  user: User
  onClose: () => void
}

export default function RatingSheet({ place, user, onClose }: Props) {
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>(null)
  const [clean, setClean] = useState(false)
  const [accessible, setAccessible] = useState(false)
  const [ibdFriendly, setIbdFriendly] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSave = async () => {
    if (!thumbs) return
    setSaving(true)

    // For OSM places, upsert a shadow record first
    let markerId: string | null = null

    if (place.source === 'community') {
      // Strip the 'community-' prefix to get the UUID
      markerId = place.id.replace('community-', '')
    } else {
      // Upsert OSM place as shadow record so we can attach ratings
      const { data, error } = await supabase
        .from('markers')
        .upsert(
          {
            category: place.category,
            lat: place.lat,
            lon: place.lon,
            name: place.name,
            source: 'osm',
            opening_hours: place.openingHours ?? null,
            wheelchair: place.wheelchair ?? false,
            fee: place.fee ?? false,
          },
          { onConflict: 'lat,lon,category,source', ignoreDuplicates: false }
        )
        .select('id')
        .single()

      if (error || !data) { setSaving(false); onClose(); return }
      markerId = data.id
    }

    await supabase.from('ratings').upsert(
      {
        marker_id: markerId,
        user_id: user.id,
        cleanliness: thumbs === 'up' ? 5 : 2,
        accessibility: accessible ? 5 : 3,
        privacy: 3,
        ibd_friendly: ibdFriendly,
      },
      { onConflict: 'marker_id,user_id' }
    )

    setSaving(false)
    setDone(true)
    setTimeout(onClose, 1200)
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/30 z-[7000]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[7001] bg-white rounded-t-2xl shadow-2xl p-6 max-w-lg mx-auto">
        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-gray-800">Thanks for your rating!</p>
            <p className="text-xs text-gray-500 mt-1">Helps the IBD community find better places</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Rate this place</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{place.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 text-lg font-bold px-2">✕</button>
            </div>

            {/* Thumbs */}
            <div className="flex gap-3 mb-5">
              {(['up', 'down'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setThumbs(t)}
                  className={`flex-1 py-4 rounded-2xl text-3xl transition-all ${
                    thumbs === t
                      ? t === 'up' ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'
                      : 'bg-gray-100'
                  }`}
                >
                  {t === 'up' ? '👍' : '👎'}
                </button>
              ))}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2 mb-5">
              {[
                { label: '✨ Clean & well maintained', value: clean, set: setClean },
                { label: '♿ Wheelchair accessible', value: accessible, set: setAccessible },
                { label: '💜 IBD Friendly', value: ibdFriendly, set: setIbdFriendly },
              ].map(({ label, value, set }) => (
                <button
                  key={label}
                  onClick={() => set(!value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                    value ? 'bg-purple-50 border border-purple-300 text-purple-700' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 ${
                    value ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}>
                    {value ? '✓' : ''}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={!thumbs || saving}
              className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-bold text-sm disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Submit Rating'}
            </button>
          </>
        )}
      </div>
    </>,
    document.body
  )
}
