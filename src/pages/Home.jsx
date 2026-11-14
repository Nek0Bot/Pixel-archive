import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGames, getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import GameCard from '../components/GameCard.jsx'
import GenreFilter from '../components/GenreFilter.jsx'
import State from '../components/State.jsx'

const URUTAN = {
  terbaru: (a, b) => b.id - a.id,
  judul: (a, b) => a.title.localeCompare(b.title, 'id'),
  rating: (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0),
  tahun: (a, b) => b.year - a.year
}

export default function Home() {
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')
  const [urutan, setUrutan] = useState('terbaru')
  const games = useFetch(() => getGames(q), [q])
  const genres = useFetch(getGenres, [])
  const warna = (id) => genres.data?.find((g) => g.id === id)?.warna || '#5B7FE8'

  const tampil = useMemo(() => {
    const daftar = (games.data || []).filter((g) => !genre || g.genre === genre)
    return [...daftar].sort(URUTAN[urutan])
  }, [games.data, genre, urutan])

  return (
    <section>
      <div className="judul-baris">
        <h1 className="judul">Pixel Archive</h1>
        <Link to="/game/baru" className="tombol">+ Tambah game</Link>
      </div>
      <p className="sub">Katalog game indie dan retro yang layak dimainkan.</p>
      <input
        className="cari"
        type="search"
        placeholder="Cari judul game"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Cari judul game"
      />
      <GenreFilter genres={genres.data || []} aktif={genre} onPilih={setGenre} urutan={urutan} onUrutan={setUrutan} />
      <State loading={games.loading} error={games.error}>
        {tampil.length === 0 ? (
          <p className="state">Tidak ada game yang cocok dengan pencarian atau filter ini.</p>
        ) : (
          <div className="grid">
            {tampil.map((g) => <GameCard key={g.id} game={g} warna={warna(g.genre)} />)}
          </div>
        )}
      </State>
    </section>
  )
}
