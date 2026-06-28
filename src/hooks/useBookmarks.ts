import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Place } from '../types'
import type { User } from '@supabase/supabase-js'

const LOCAL_KEY = 'ibd-bookmarks-v2'

export interface Bookmark {
  localId: string   // stable key for list rendering
  dbId?: string     // Supabase row id (when signed in)
  placeId: string   // original place.id for dedup
  name: string
  lat: number
  lon: number
  category: string
  savedAt: string
}

function loadLocal(): Bookmark[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') }
  catch { return [] }
}

function saveLocal(items: Bookmark[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

export function useBookmarks(user: User | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // Load on mount / user change
  useEffect(() => {
    if (!user) {
      setBookmarks(loadLocal())
      return
    }
    supabase
      .from('bookmarks')
      .select('id, lat, lon, name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookmarks(
          (data ?? []).map(r => ({
            localId: r.id,
            dbId: r.id,
            placeId: `${r.lat},${r.lon}`,
            name: r.name ?? 'Saved place',
            lat: r.lat,
            lon: r.lon,
            category: 'toilet',
            savedAt: r.created_at,
          }))
        )
      })
  }, [user?.id])

  const isBookmarked = useCallback(
    (place: Place) => bookmarks.some(b => b.placeId === place.id || b.placeId === `${place.lat},${place.lon}`),
    [bookmarks]
  )

  const toggleBookmark = useCallback(
    async (place: Place) => {
      const key = place.id || `${place.lat},${place.lon}`
      const existing = bookmarks.find(b => b.placeId === key || b.placeId === `${place.lat},${place.lon}`)

      if (existing) {
        // Remove
        setBookmarks(prev => prev.filter(b => b.localId !== existing.localId))
        if (user && existing.dbId) {
          await supabase.from('bookmarks').delete().eq('id', existing.dbId)
        } else if (!user) {
          saveLocal(bookmarks.filter(b => b.localId !== existing.localId))
        }
      } else {
        // Add
        const entry: Bookmark = {
          localId: crypto.randomUUID(),
          placeId: key,
          name: place.name,
          lat: place.lat,
          lon: place.lon,
          category: place.category,
          savedAt: new Date().toISOString(),
        }
        if (user) {
          const { data } = await supabase
            .from('bookmarks')
            .insert({ user_id: user.id, lat: place.lat, lon: place.lon, name: place.name })
            .select('id')
            .single()
          entry.dbId = data?.id
        } else {
          saveLocal([entry, ...bookmarks])
        }
        setBookmarks(prev => [entry, ...prev])
      }
    },
    [bookmarks, user]
  )

  return { bookmarks, isBookmarked, toggleBookmark }
}
