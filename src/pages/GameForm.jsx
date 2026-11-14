import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGame, getGame, getGenres, updateGame } from '../api.js'
import useFetch from '../useFetch.js'
import ImageUpload from '../components/ImageUpload.jsx'
import { clearDraft, loadDraft, saveDraft } from '../services/draftStorage.js'

const KOSONG = {
  title: '', genre: '', year: new Date().getFullYear(), developer: '',
  platform: '', emoji: '🎮', description: '', image_url: ''
}

export default function GameForm() {
  const { id } = useParams()
  const edit = Boolean(id)
  const navigate = useNavigate()
  const genres = useFetch(getGenres, [])
  const [draf] = useState(() => (edit ? null : loadDraft()))
  const [form, setForm] = useState(draf || KOSONG)
  const [pakaiDraf, setPakaiDraf] = useState(Boolean(draf))
  const [galat, setGalat] = useState('')
  const [simpan, setSimpan] = useState(false)

  useEffect(() => {
    if (!edit) return
    getGame(id)
      .then((g) => setForm({ ...g, image_url: g.image_url || '' }))
      .catch((e) => setGalat(e.message))
  }, [id, edit])

  // Simpan draf otomatis hanya untuk form tambah game baru
  useEffect(() => {
    if (edit) return
    const kosong = !form.title && !form.developer && !form.description && !form.image_url
    if (kosong) clearDraft()
    else saveDraft(form)
  }, [form, edit])

  function buangDraf() {
    clearDraft()
    setForm(KOSONG)
    setPakaiDraf(false)
  }

  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function kirim(e) {
    e.preventDefault()
    setGalat('')
    setSimpan(true)
    try {
      const hasil = edit ? await updateGame(id, form) : await createGame(form)
      if (!edit) clearDraft()
      navigate(`/game/${hasil.id}`, { replace: true })
    } catch (err) {
      setGalat(err.message)
      setSimpan(false)
    }
  }

  return (
    <section>
      <button className="kembali" onClick={() => navigate(-1)}>‹ Batal</button>
      <h1 className="judul">{edit ? 'Ubah game' : 'Tambah game'}</h1>
      {pakaiDraf && (
        <p className="catatan">Draf sebelumnya dipulihkan. <button type="button" className="tautan" onClick={buangDraf}>Buang draf</button></p>
      )}
      <p className="catatan">Rating dihitung otomatis dari review pengguna setelah game disimpan.</p>
      <form className="form" onSubmit={kirim}>
        <label>Judul
          <input name="title" value={form.title} onChange={ubah} required />
        </label>
        <label>Genre
          <select name="genre" value={form.genre} onChange={ubah} required>
            <option value="">Pilih genre</option>
            {genres.data?.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
          </select>
        </label>
        <label>Tahun rilis
          <input name="year" type="number" value={form.year} onChange={ubah} required />
        </label>
        <label>Pengembang
          <input name="developer" value={form.developer} onChange={ubah} required />
        </label>
        <label>Platform
          <input name="platform" value={form.platform} onChange={ubah} placeholder="PC, Switch, Mobile" />
        </label>
        <label>Emoji cover
          <input name="emoji" value={form.emoji} onChange={ubah} maxLength={4} />
        </label>
        <ImageUpload value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />
        <label>Deskripsi
          <textarea name="description" rows="4" value={form.description} onChange={ubah} />
        </label>
        {galat && <p className="state galat">{galat}</p>}
        <button className="tombol" type="submit" disabled={simpan}>
          {simpan ? 'Menyimpan...' : edit ? 'Simpan perubahan' : 'Simpan game'}
        </button>
      </form>
    </section>
  )
}
