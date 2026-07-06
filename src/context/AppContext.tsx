import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { AppState, CategorySelection, RangeMetres } from '../types'

type Action =
  | { type: 'SET_LOCATION'; lat: number; lon: number }
  | { type: 'SET_CATEGORY'; category: CategorySelection | null }
  | { type: 'SET_RANGE'; range: RangeMetres }
  | { type: 'TOGGLE_OPEN_NOW' }
  | { type: 'TOGGLE_CANT_WAIT' }
  | { type: 'TOGGLE_FLARE' }

const initial: AppState = {
  userLocation: null,
  activeCategory: 'all',
  range: 1000,
  openNowOnly: false,
  showCantWait: false,
  flareMode: false,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, userLocation: { lat: action.lat, lon: action.lon } }
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.category }
    case 'SET_RANGE':
      return { ...state, range: action.range }
    case 'TOGGLE_OPEN_NOW':
      return { ...state, openNowOnly: !state.openNowOnly }
    case 'TOGGLE_CANT_WAIT':
      return { ...state, showCantWait: !state.showCantWait }
    case 'TOGGLE_FLARE':
      return { ...state, flareMode: !state.flareMode }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
