import { Link } from 'react-router-dom'
import { getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import State from '../components/State.jsx'

export default function Genres() {
  const { data, loading, error } = useFetch(getGenres, [])
  return (
    <section>
      <h1 className="judul">Genre</h1>
      <p className="sub">Pilih genre untuk melihat game di dalamnya.</p>
      <State loading={loading} error={error}>
        <ul className="daftar">
          {data?.map((g) => (
            <li key={g.id}>
              <Link to={`/genre/${g.id}`} className="genre-item">
                <span className="genre-ikon" style={{ "--w": g.warna }}>{g.emoji}</span>
                <span className="genre-teks">
                  <strong>{g.nama}</strong>
                  <small>{g.deskripsi}</small>
                </span>
                <span className="jumlah">{g.jumlah} game</span>
              </Link>
            </li>
          ))}
        </ul>
      </State>
    </section>
  )
}
