import { useState } from 'react'
import { labelRating } from '../lib/rating.js'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteGame, getGame, getGenres } from '../api.js'
import useFetch from '../useFetch.js'
import Cover from '../components/Cover.jsx'
import State from '../components/State.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import ReviewSection from '../components/ReviewSection.jsx'
import QuoteSection from '../components/QuoteSection.jsx'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const game = useFetch(() => getGame(id), [id])
  const genres = useFetch(getGenres, [])
  const [galat, setGalat] = useState('')
  const [konfirmasi, setKonfirmasi] = useState(false)
  const [ringkas, setRingkas] = useState(null) // rata-rata terbaru dari ReviewSection
  const genre = genres.data?.find((g) => g.id === game.data?.genre)

  async function hapus() {
    setKonfirmasi(false)
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
            <div className="detail-grid">
              <div className="detail-banner">
                <Cover game={game.data} warna={genre?.warna} besar />
              </div>
              <div className="detail-isi">
            <div className="judul-baris">
              <h1 className="judul">{game.data.title}</h1>
              <FavoriteButton gameId={game.data.id} className="besar" />
            </div>
            <p className="rating besar">{labelRating({ rating: ringkas ?? game.data.rating })}{Number(ringkas ?? game.data.rating) > 0 && ' dari 5'}</p>
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
              <button className="tombol bahaya" onClick={() => setKonfirmasi(true)}>Hapus</button>
            </div>
              </div>
            </div>
            <QuoteSection gameId={game.data.id} />
            <ReviewSection gameId={game.data.id} onRata={setRingkas} />
            <ConfirmModal
              open={konfirmasi}
              judul="Hapus game?"
              pesan={`"${game.data.title}" beserta review dan quote-nya akan dihapus dari katalog.`}
              labelYa="Hapus"
              onYa={hapus}
              onBatal={() => setKonfirmasi(false)}
            />
          </article>
        )}
      </State>
    </section>
  )
}
