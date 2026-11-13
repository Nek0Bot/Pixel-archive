import { useNavigate, useParams } from 'react-router-dom'
import { getGenre } from '../api.js'
import useFetch from '../useFetch.js'
import GameCard from '../components/GameCard.jsx'
import State from '../components/State.jsx'

export default function GenreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useFetch(() => getGenre(id), [id])

  return (
    <section>
      <button className="kembali" onClick={() => navigate('/genre')}>‹ Semua genre</button>
      <State loading={loading} error={error}>
        {data && (
          <>
            <h1 className="judul">{data.emoji} {data.nama}</h1>
            <p className="sub">{data.deskripsi}</p>
            <div className="grid">
              {data.games.map((g) => <GameCard key={g.id} game={g} warna={data.warna} />)}
            </div>
          </>
        )}
      </State>
    </section>
  )
}
