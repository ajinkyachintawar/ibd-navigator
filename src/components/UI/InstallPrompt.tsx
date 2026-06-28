import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-dismissed') === 'true'
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  const handleInstall = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDismissed(true)
      localStorage.setItem('pwa-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
      <div className="text-2xl flex-shrink-0">🧭</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">Add IBD Navigator</p>
        <p className="text-xs text-gray-500">Install for offline access & faster loading</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleDismiss}
          className="text-xs text-gray-400 px-2 py-1"
          aria-label="Dismiss"
        >
          ✕
        </button>
        <button
          onClick={handleInstall}
          className="text-xs font-bold text-white bg-purple-600 px-3 py-1.5 rounded-xl"
        >
          Install
        </button>
      </div>
    </div>
  )
}
