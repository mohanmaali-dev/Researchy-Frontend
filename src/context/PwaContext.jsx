/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

const PwaContext = createContext({ online: true, canInstall: false, installApp: async () => false })

export function PwaProvider({ children }) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState(null)
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    const handleInstallPrompt = (event) => { event.preventDefault(); setInstallPrompt(event) }
    const handleInstalled = () => setInstallPrompt(null)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const result = await installPrompt.userChoice
    setInstallPrompt(null)
    return result.outcome === 'accepted'
  }

  return <PwaContext.Provider value={{ online, canInstall: Boolean(installPrompt) || isIos, isIos, installApp }}>{children}</PwaContext.Provider>
}

export const usePwa = () => useContext(PwaContext)

export function OfflineBanner() {
  const { online } = usePwa()
  if (online) return null
  return <div role="status" className="fixed inset-x-3 top-3 z-[120] rounded-md bg-amber-600 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-lg">You are offline. Previously opened pages may still be available.</div>
}
