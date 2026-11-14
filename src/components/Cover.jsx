import { useState } from 'react'

// Cover game: pakai gambar dari URL bila ada, jika tidak tampil seni piksel bergradasi
export default function Cover({ game, warna = '#5B7FE8', besar = false }) {
  const [rusak, setRusak] = useState(false)
  const adaGambar = game.image_url && !rusak

  return (
    <div className={`cover ${besar ? 'besar' : ''} ${adaGambar ? 'ada-gambar' : ''}`} style={{ '--warna': warna }}>
      {adaGambar ? (
        <img src={game.image_url} alt={`Cover ${game.title}`} loading="lazy" onError={() => setRusak(true)} />
      ) : (
        <>
          <span className="cover-piksel" aria-hidden="true" />
          <span className="cover-emoji" aria-hidden="true">{game.emoji}</span>
        </>
      )}
    </div>
  )
}
