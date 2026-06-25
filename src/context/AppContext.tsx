import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Category, RangeMetres } from '../types'

type Action =
  | { type: 'SET_LOCATION'; lat: number; lon: number }
  | { type: 'SET_CATEGORY'; category: Category | null }
  | { type: 'SET_RANGE'; range: RangeMetres }
  | { type: 'TOGGLE_OPEN_NOW' }
  | { type: 'TOGGLE_CANT_WAIT' }

const initial: AppState = {
  userLocation: null,
  activeCategory: null,
  range: 1000,
  openNowOnly: false,
  showCantWait: false,
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
