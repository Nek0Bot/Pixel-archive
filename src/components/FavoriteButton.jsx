import useFavorites from '../hooks/useFavorites.js'

export default function FavoriteButton({ gameId, className = '' }) {
  const { isFavorite, toggle } = useFavorites()
  const aktif = isFavorite(gameId)
  return (
    <button
      type="button"
      className={`fav ${aktif ? 'aktif' : ''} ${className}`}
      aria-pressed={aktif}
      aria-label={aktif ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      onClick={() => toggle(gameId)}
    >
      {aktif ? '♥' : '♡'}
    </button>
  )
}
