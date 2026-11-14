import { useState } from 'react'
import { useQuotes } from '../hooks/useQuotes.js'

const JENIS = { quote: 'Quote', momen: 'Momen' }

export default function QuoteSection({ gameId }) {
  const { items, loading, error, aktif, tambah, hapus } = useQuotes(gameId)
  const [filter, setFilter] = useState('')
  const [kind, setKind] = useState('quote')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [galat, setGalat] = useState('')
  const [kirim, setKirim] = useState(false)
  const tampil = filter ? items.filter((q) => q.kind === filter) : items

  async function submit(e) {
    e.preventDefault()
    setGalat('')
    setKirim(true)
    try {
      await tambah({ kind, content: content.trim(), source: source.trim() || null })
      setContent('')
      setSource('')
    } catch (err) {
      setGalat(err.message)
    } finally {
      setKirim(false)
    }
  }

  return (
    <section className="blok" aria-labelledby="judul-quote">
      <h2 id="judul-quote">Quote dan momen</h2>
      {!aktif ? (
        <p className="catatan">Quote dan momen tersedia setelah game ini tersinkron ke server.</p>
      ) : (
        <>
          <div className="pills" role="group" aria-label="Filter jenis">
            <button className={`pill ${filter === '' ? 'aktif' : ''}`} onClick={() => setFilter('')}>Semua</button>
            {Object.entries(JENIS).map(([k, label]) => (
              <button key={k} className={`pill ${filter === k ? 'aktif' : ''}`} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
          {loading && <p className="state">Memuat...</p>}
          {error && <p className="state galat">{error}</p>}
          {!loading && !error && tampil.length === 0 && <p className="catatan">Belum ada yang dicatat.</p>}
          <ul className="daftar-kecil">
            {tampil.map((q) => (
              <li key={q.id} className="item kutipan">
                <span className="label-jenis">{JENIS[q.kind] || q.kind}</span>
                <blockquote>{q.content}</blockquote>
                {q.source && <cite>{q.source}</cite>}
                <button className="tautan bahaya" onClick={() => hapus(q.id).catch((e) => setGalat(e.message))}>Hapus</button>
              </li>
            ))}
          </ul>
          <form className="form" onSubmit={submit}>
            <div className="dua">
              <label>Jenis
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="quote">Quote</option>
                  <option value="momen">Momen</option>
                </select>
              </label>
              <label>Sumber (opsional)
                <input value={source} onChange={(e) => setSource(e.target.value)} maxLength={80} placeholder="Karakter atau bab" />
              </label>
            </div>
            <label>{kind === 'quote' ? 'Isi quote' : 'Ceritakan momennya'}
              <textarea rows="3" value={content} onChange={(e) => setContent(e.target.value)} maxLength={600} required />
            </label>
            {galat && <p className="state galat">{galat}</p>}
            <button className="tombol" type="submit" disabled={kirim}>{kirim ? 'Menyimpan...' : 'Tambah'}</button>
          </form>
        </>
      )}
    </section>
  )
}
