import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getGames, getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import GameCard from '../components/GameCard.jsx'
import State from '../components/State.jsx'

export default function Home() {
  const [q, setQ] = useState('')
  const games = useFetch(() => getGames(q), [q])
  const genres = useFetch(getGenres, [])
  const warna = (id) => genres.data?.find((g) => g.id === id)?.warna || '#5B7FE8'

  return (
    <section>
      <div className="judul-baris">
        <h1 className="judul">Arsip Piksel</h1>
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
      <State loading={games.loading} error={games.error}>
        {games.data?.length === 0 ? (
          <p className="state">Belum ada game yang cocok. Coba kata kunci lain atau tambah game baru.</p>
        ) : (
          <div className="grid">
            {games.data?.map((g) => <GameCard key={g.id} game={g} warna={warna(g.genre)} />)}
          </div>
        )}
      </State>
    </section>
  )
}
