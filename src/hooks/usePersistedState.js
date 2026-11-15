import { useEffect, useState } from 'react'

// State yang tersimpan di sessionStorage: bertahan saat pindah halaman atau kembali,
// dan otomatis kosong lagi saat tab ditutup.
export default function usePersistedState(key, awal) {
  const [nilai, setNilai] = useState(() => {
    try {
      const tersimpan = sessionStorage.getItem(key)
      return tersimpan === null ? awal : JSON.parse(tersimpan)
    } catch {
      return awal
    }
  })

  useEffect(() => {
    try { sessionStorage.setItem(key, JSON.stringify(nilai)) } catch { /* abaikan */ }
  }, [key, nilai])

  return [nilai, setNilai]
}