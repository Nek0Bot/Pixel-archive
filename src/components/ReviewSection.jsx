import { useEffect, useState } from 'react'
import { useReviews } from '../hooks/useReviews.js'
import { getUser, saveUser } from '../services/userService.js'
import FormModal from './FormModal.jsx'

const bintang = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)
const RINGKAS = 3

function ReviewForm({ user, onKirim }) {
  const [nama, setNama] = useState(user.name)
  const [rating, setRating] = useState(5)
  const [komentar, setKomentar] = useState('')
  const [galat, setGalat] = useState('')
  const [kirim, setKirim] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setGalat('')
    setKirim(true)
    try {
      saveUser({ name: nama })
      await onKirim({ reviewer_name: nama.trim() || 'Anonim', rating: Number(rating), comment: komentar.trim(), user_id: user.id })
    } catch (err) {
      setGalat(err.message)
      setKirim(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="dua">
        <label>Nama
          <input value={nama} onChange={(e) => setNama(e.target.value)} maxLength={40} placeholder="Anonim" />
        </label>
        <label>Rating
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{bintang(n)}</option>)}
          </select>
        </label>
      </div>
      <label>Komentar
        <textarea rows="4" value={komentar} onChange={(e) => setKomentar(e.target.value)} maxLength={500} required autoFocus />
      </label>
      {galat && <p className="state galat">{galat}</p>}
      <button className="tombol" type="submit" disabled={kirim}>{kirim ? 'Mengirim...' : 'Kirim review'}</button>
    </form>
  )
}

export default function ReviewSection({ gameId, onRata }) {
  const user = getUser()
  const { items, loading, error, aktif, tambah, hapus } = useReviews(gameId)
  const [buka, setBuka] = useState(false)
  const [semua, setSemua] = useState(false)
  const [galat, setGalat] = useState('')
  const rata = items.length ? (items.reduce((a, r) => a + r.rating, 0) / items.length).toFixed(1) : null
  const tampil = semua ? items : items.slice(0, RINGKAS)

  // Kabarkan rata-rata terbaru agar rating di bagian atas halaman ikut berubah
  useEffect(() => { if (aktif && !loading && !error && onRata) onRata(rata ? Number(rata) : 0) }, [rata, aktif, loading, error, onRata])

  return (
    <section className="blok" aria-labelledby="judul-review">
      <div className="blok-kepala">
        <h2 id="judul-review">Review {rata && <small>★ {rata} dari {items.length} ulasan</small>}</h2>
        {aktif && <button className="tombol kecil" onClick={() => setBuka(true)}>+ Tulis review</button>}
      </div>
      {!aktif && <p className="catatan">Review tersedia setelah game ini tersinkron ke server.</p>}
      {aktif && loading && <p className="state">Memuat review...</p>}
      {error && <p className="state galat">{error}</p>}
      {galat && <p className="state galat">{galat}</p>}
      {aktif && !loading && !error && items.length === 0 && <p className="catatan">Belum ada review. Jadilah yang pertama.</p>}
      <ul className="daftar-kecil">
        {tampil.map((r) => (
          <li key={r.id} className="item">
            <div className="item-kepala">
              <strong>{r.reviewer_name}</strong>
              <span className="rating">{bintang(r.rating)}</span>
            </div>
            <p>{r.comment}</p>
            {r.user_id === user.id && (
              <button className="tautan bahaya" onClick={() => hapus(r.id).catch((e) => setGalat(e.message))}>Hapus review saya</button>
            )}
          </li>
        ))}
      </ul>
      {items.length > RINGKAS && (
        <button className="tautan" onClick={() => setSemua((s) => !s)}>
          {semua ? 'Tampilkan lebih sedikit' : `Lihat semua ${items.length} review`}
        </button>
      )}
      <FormModal open={buka} judul="Tulis review" onTutup={() => setBuka(false)}>
        <ReviewForm user={user} onKirim={async (body) => { await tambah(body); setBuka(false) }} />
      </FormModal>
    </section>
  )
}
