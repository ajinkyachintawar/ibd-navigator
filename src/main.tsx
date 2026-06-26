import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // cache places for 1 min
      gcTime: 5 * 60_000,          // keep in memory for 5 min
      retry: false,                // we retry internally across 3 endpoints
      refetchOnWindowFocus: false, // don't re-search when user switches tabs
      refetchOnReconnect: false,   // don't re-search on network reconnect
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
)
