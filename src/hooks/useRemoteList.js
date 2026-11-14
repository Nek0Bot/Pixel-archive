import { useCallback, useEffect, useState } from 'react'

// Memuat daftar milik sebuah game; game lokal (id negatif) belum punya data di server.
export default function useRemoteList(gameId, ambil, buat, hapusItem) {
  const aktif = Number(gameId) > 0
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(aktif)
  const [error, setError] = useState('')

  const muat = useCallback(async () => {
    if (!aktif) return
    setLoading(true)
    setError('')
    try {
      setItems(await ambil(Number(gameId)))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [gameId, aktif, ambil])

  useEffect(() => { muat() }, [muat])

  const tambah = async (body) => {
    const baru = await buat({ ...body, game_id: Number(gameId) })
    setItems((lama) => [baru, ...lama])
  }
  const hapus = async (id) => {
    await hapusItem(id)
    setItems((lama) => lama.filter((x) => x.id !== id))
  }
  return { items, loading, error, aktif, tambah, hapus, muat }
}
