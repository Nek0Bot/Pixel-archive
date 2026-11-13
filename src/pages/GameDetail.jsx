import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteGame, getGame, getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import Cover from '../components/Cover.jsx'
import State from '../components/State.jsx'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const game = useFetch(() => getGame(id), [id])
  const genres = useFetch(getGenres, [])
  const [galat, setGalat] = useState('')
  const genre = genres.data?.find((g) => g.id === game.data?.genre)

  async function hapus() {
    if (!window.confirm(`Hapus "${game.data.title}" dari katalog?`)) return
    try {
      await deleteGame(id)
      navigate('/', { replace: true })
    } catch (e) {
      setGalat(e.message)
    }
  }

  return (
    <section>
      <button className="kembali" onClick={() => navigate(-1)}>‹ Kembali</button>
      <State loading={game.loading} error={game.error}>
        {game.data && (
          <article>
            <Cover game={game.data} warna={genre?.warna} besar />
            <h1 className="judul">{game.data.title}</h1>
            <p className="rating besar">★ {game.data.rating.toFixed(1)} dari 5</p>
            <p className="deskripsi">{game.data.description}</p>
            <dl className="info">
              <dt>Pengembang</dt><dd>{game.data.developer}</dd>
              <dt>Rilis</dt><dd>{game.data.year}</dd>
              <dt>Platform</dt><dd>{game.data.platform}</dd>
              <dt>Genre</dt>
              <dd>{genre ? <Link to={`/genre/${genre.id}`}>{genre.nama}</Link> : game.data.genre}</dd>
            </dl>
            {galat && <p className="state galat">{galat}</p>}
            <div className="aksi">
              <Link to={`/game/${id}/edit`} className="tombol">Ubah</Link>
              <button className="tombol bahaya" onClick={hapus}>Hapus</button>
            </div>
          </article>
        )}
      </State>
    </section>
  )
}
