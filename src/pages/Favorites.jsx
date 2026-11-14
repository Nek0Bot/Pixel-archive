import { Link } from 'react-router-dom'
import { getGames, getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import useFavorites from '../hooks/useFavorites.js'
import GameCard from '../components/GameCard.jsx'
import State from '../components/State.jsx'

export default function Favorites() {
  const { ids } = useFavorites()
  const games = useFetch(() => getGames(), [])
  const genres = useFetch(getGenres, [])
  const warna = (id) => genres.data?.find((g) => g.id === id)?.warna || '#5B7FE8'
  const daftar = (games.data || []).filter((g) => ids.includes(g.id))

  return (
    <section>
      <h1 className="judul">Favorit</h1>
      <p className="sub">Game yang kamu tandai. Tersimpan di perangkat dan bisa dibuka offline.</p>
      <State loading={games.loading} error={games.error}>
        {daftar.length === 0 ? (
          <p className="state">Belum ada favorit. Ketuk ikon hati pada game, atau <Link to="/">jelajahi katalog</Link>.</p>
        ) : (
          <div className="grid">
            {daftar.map((g) => <GameCard key={g.id} game={g} warna={warna(g.genre)} />)}
          </div>
        )}
      </State>
    </section>
  )
}
