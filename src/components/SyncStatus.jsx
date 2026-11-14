import { useEffect, useState } from 'react'
import { getPendingCount } from '../offline/db.js'
import { syncPendingChanges } from '../api.js'

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pending, setPending] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let aktif = true
    const refresh = async () => {
      const count = await getPendingCount()
      if (aktif) setPending(count)
    }
    const sync = async () => {
      if (!navigator.onLine) return
      setSyncing(true)
      await syncPendingChanges()
      await refresh()
      if (aktif) setSyncing(false)
    }
    const online = () => { setIsOnline(true); sync() }
    const offline = () => setIsOnline(false)
    const queueChanged = () => refresh()

    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    window.addEventListener('pixel-archive-queue-change', queueChanged)
    refresh()
    sync()

    return () => {
      aktif = false
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
      window.removeEventListener('pixel-archive-queue-change', queueChanged)
    }
  }, [])

  let message = 'Online · semua perubahan tersinkron'
  if (!isOnline) message = pending ? `Offline · ${pending} perubahan menunggu sinkronisasi` : 'Offline · memakai data tersimpan di perangkat'
  else if (syncing) message = 'Menyinkronkan perubahan...'
  else if (pending) message = `Online · ${pending} perubahan menunggu sinkronisasi`

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: '7px 14px',
        textAlign: 'center',
        fontSize: '12px',
        background: isOnline ? '#e8f5ed' : '#fff1d6',
        color: '#263238'
      }}
    >
      {message}
    </div>
  )
}
