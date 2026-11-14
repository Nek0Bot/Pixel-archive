import { useEffect, useState } from 'react'
import { getFavoriteIds, toggleFavorite } from '../services/favoriteService.js'

export default function useFavorites() {
  const [ids, setIds] = useState(getFavoriteIds)
  useEffect(() => {
    const segarkan = () => setIds(getFavoriteIds())
    window.addEventListener('pixel-archive-favorites', segarkan)
    return () => window.removeEventListener('pixel-archive-favorites', segarkan)
  }, [])
  return { ids, isFavorite: (id) => ids.includes(id), toggle: toggleFavorite }
}
