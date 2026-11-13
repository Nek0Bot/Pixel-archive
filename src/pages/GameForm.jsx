import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGame, getGame, getGenres, updateGame } from '../api.js'
import useFetch from '../useFetch.js'

const KOSONG = {
  title: '', genre: '', year: new Date().getFullYear(), developer: '',
  rating: 4, platform: '', emoji: '🎮', description: '', image_url: ''
}

export default function GameForm() {
  const { id } = useParams()
  const edit = Boolean(id)
  const navigate = useNavigate()
  const genres = useFetch(getGenres, [])
  const [form, setForm] = useState(KOSONG)
  const [galat, setGalat] = useState('')
  const [simpan, setSimpan] = useState(false)

  useEffect(() => {
    if (!edit) return
    getGame(id)
      .then((g) => setForm({ ...g, image_url: g.image_url || '' }))
      .catch((e) => setGalat(e.message))
  }, [id, edit])

  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function kirim(e) {
    e.preventDefault()
    setGalat('')
    setSimpan(true)
    try {
      const hasil = edit ? await updateGame(id, form) : await createGame(form)
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
        <div className="dua">
          <label>Tahun rilis
            <input name="year" type="number" value={form.year} onChange={ubah} required />
          </label>
          <label>Rating (0-5)
            <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={ubah} required />
          </label>
        </div>
        <label>Pengembang
          <input name="developer" value={form.developer} onChange={ubah} required />
        </label>
        <label>Platform
          <input name="platform" value={form.platform} onChange={ubah} placeholder="PC, Switch, Mobile" />
        </label>
        <label>Emoji cover
          <input name="emoji" value={form.emoji} onChange={ubah} maxLength={4} />
        </label>
        <label>URL gambar (opsional)
          <input name="image_url" value={form.image_url} onChange={ubah} placeholder="https://..." />
        </label>
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
