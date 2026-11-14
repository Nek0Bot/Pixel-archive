import { useState } from 'react'
import { useQuotes } from '../hooks/useQuotes.js'
import FormModal from './FormModal.jsx'

const JENIS = { quote: 'Quote', momen: 'Momen' }
const RINGKAS = 3

function QuoteForm({ onKirim }) {
  const [kind, setKind] = useState('quote')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [galat, setGalat] = useState('')
  const [kirim, setKirim] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setGalat('')
    setKirim(true)
    try {
      await onKirim({ kind, content: content.trim(), source: source.trim() || null })
    } catch (err) {
      setGalat(err.message)
      setKirim(false)
    }
  }

  return (
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
        <textarea rows="4" value={content} onChange={(e) => setContent(e.target.value)} maxLength={600} required autoFocus />
      </label>
      {galat && <p className="state galat">{galat}</p>}
      <button className="tombol" type="submit" disabled={kirim}>{kirim ? 'Menyimpan...' : 'Tambah'}</button>
    </form>
  )
}

export default function QuoteSection({ gameId }) {
  const { items, loading, error, aktif, tambah, hapus } = useQuotes(gameId)
  const [filter, setFilter] = useState('')
  const [buka, setBuka] = useState(false)
  const [semua, setSemua] = useState(false)
  const [galat, setGalat] = useState('')
  const disaring = filter ? items.filter((q) => q.kind === filter) : items
  const tampil = semua ? disaring : disaring.slice(0, RINGKAS)

  return (
    <section className="blok" aria-labelledby="judul-quote">
      <div className="blok-kepala">
        <h2 id="judul-quote">Quote dan momen</h2>
        {aktif && <button className="tombol kecil" onClick={() => setBuka(true)}>+ Tambah</button>}
      </div>
      {!aktif && <p className="catatan">Quote dan momen tersedia setelah game ini tersinkron ke server.</p>}
      {aktif && items.length > 0 && (
        <div className="pills" role="group" aria-label="Filter jenis">
          <button className={`pill ${filter === '' ? 'aktif' : ''}`} onClick={() => setFilter('')}>Semua</button>
          {Object.entries(JENIS).map(([k, label]) => (
            <button key={k} className={`pill ${filter === k ? 'aktif' : ''}`} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
      )}
      {aktif && loading && <p className="state">Memuat...</p>}
      {error && <p className="state galat">{error}</p>}
      {galat && <p className="state galat">{galat}</p>}
      {aktif && !loading && !error && disaring.length === 0 && <p className="catatan">Belum ada yang dicatat.</p>}
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
      {disaring.length > RINGKAS && (
        <button className="tautan" onClick={() => setSemua((s) => !s)}>
          {semua ? 'Tampilkan lebih sedikit' : `Lihat semua ${disaring.length}`}
        </button>
      )}
      <FormModal open={buka} judul="Tambah quote atau momen" onTutup={() => setBuka(false)}>
        <QuoteForm onKirim={async (body) => { await tambah(body); setBuka(false) }} />
      </FormModal>
    </section>
  )
}
