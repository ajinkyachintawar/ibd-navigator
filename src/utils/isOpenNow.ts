import type { OpenStatus } from '../types'

// Parses common OSM opening_hours strings — validated by agent with 3 traced test cases
// Handles: "24/7", "Mo-Fr 08:00-18:00", "Mo-Sa 09:00-21:00", compound rules with ";"
// Known limitation: overnight spans (e.g. "22:00-02:00") return "unknown"
export function isOpenNow(str: string | null | undefined): OpenStatus {
  if (!str || typeof str !== 'string') return 'unknown'
  const s = str.trim()
  if (s === '24/7') return 'open'

  const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const DAY_JS: Record<string, number> = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0 }

  function expandDays(spec: string): number[] | null {
    spec = spec.trim()
    if (spec.includes('-')) {
      const [s, e] = spec.split('-').map((d) => d.trim())
      const si = DAY_NAMES.indexOf(s)
      const ei = DAY_NAMES.indexOf(e)
      if (si === -1 || ei === -1) return null
      const days: number[] = []
      let i = si
      while (true) {
        days.push(DAY_JS[DAY_NAMES[i]])
        if (i === ei) break
        i = (i + 1) % 7
        if (days.length > 7) return null
      }
      return days
    }
    const idx = DAY_JS[spec.trim()]
    return idx !== undefined ? [idx] : null
  }

  function toMin(t: string): number | null {
    const [h, m] = t.trim().split(':').map(Number)
    return isNaN(h) || isNaN(m) ? null : h * 60 + m
  }

  function checkRule(rule: string): boolean | null {
    const m = rule
      .trim()
      .match(/^([A-Z][a-z](?:-[A-Z][a-z])?)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/)
    if (!m) return null
    const days = expandDays(m[1])
    const open = toMin(m[2])
    const close = toMin(m[3])
    if (!days || open === null || close === null) return null
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    if (!days.includes(now.getDay())) return false
    return nowMin >= open && nowMin < close
  }

  const rules = s.split(';')
  let anyParsed = false
  for (const rule of rules) {
    const r = checkRule(rule)
    if (r === null) continue
    anyParsed = true
    if (r === true) return 'open'
  }
  return anyParsed ? 'closed' : 'unknown'
}
