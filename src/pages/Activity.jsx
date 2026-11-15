import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getActivity } from '../services/activityService.js'
import useFetch from '../useFetch.js'
import usePersistedState from '../hooks/usePersistedState.js'
import State from '../components/State.jsx'

const JENIS = {
  game_added: { ikon: '➕', teks: (a) => `Game baru ditambahkan: ${a.game_title}` },
  game_updated: { ikon: '✏️', teks: (a) => `Game diperbarui: ${a.game_title}` },
  game_deleted: { ikon: '🗑️', teks: (a) => `Game dihapus: ${a.game_title}` },
  review_added: { ikon: '⭐', teks: (a) => `Review baru untuk ${a.game_title}` },
  quote_added: { ikon: '💬', teks: (a) => `${a.detail === 'moment' ? 'Momen' : 'Quote'} baru untuk ${a.game_title}` }
}
const FILTER = [
  { id: '', label: 'Semua' },
  { id: 'game', label: 'Game' },
  { id: 'review', label: 'Review' },
  { id: 'quote', label: 'Quote' }
]

function waktu(iso) {
  const detik = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const fmt = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
  const batas = [['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unit, dtk] of batas) {
    if (Math.abs(detik) >= dtk) return fmt.format(Math.round(detik / dtk), unit)
  }
  return 'baru saja'
}

export default function Activity() {
  const [filter, setFilter] = usePersistedState('pa_aktivitas_filter', '')
  const [versi, setVersi] = useState(0)
  const { data, loading, error } = useFetch(() => getActivity(), [versi])
  const items = (data?.items || []).filter((a) => !filter || a.kind.startsWith(filter))

  return (
    <section>
      <div className="judul-baris">
        <h1 className="judul">Aktivitas</h1>
        <button className="tombol kecil netral" onClick={() => setVersi((v) => v + 1)}>Segarkan</button>
      </div>
      <p className="sub">Catatan otomatis dari perubahan game, review, dan quote.</p>
      <div className="pills" role="group" aria-label="Filter aktivitas">
        {FILTER.map((f) => (
          <button key={f.id} className={`pill ${filter === f.id ? 'aktif' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <State loading={loading} error={error}>
        {data?.dariCache && <p className="catatan">Menampilkan data tersimpan terakhir (offline atau server tidak terjangkau).</p>}
        {items.length === 0 ? (
          <p className="state">Belum ada aktivitas.</p>
        ) : (
          <ul className="daftar-kecil">
            {items.map((a) => {
              const j = JENIS[a.kind]
              const isi = (
                <>
                  <span className="aktivitas-ikon" aria-hidden="true">{j.ikon}</span>
                  <span className="aktivitas-teks">
                    <strong>{j.teks(a)}</strong>
                    {a.kind === 'review_added' && a.detail && <small>{a.detail}</small>}
                    <small>{waktu(a.created_at)}</small>
                  </span>
                </>
              )
              return (
                <li key={a.id}>
                  {a.game_id ? <Link to={`/game/${a.game_id}`} className="item aktivitas">{isi}</Link> : <div className="item aktivitas">{isi}</div>}
                </li>
              )
            })}
          </ul>
        )}
      </State>
    </section>
  )
}
