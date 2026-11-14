import { Link } from 'react-router-dom'
import Cover from './Cover.jsx'
import { labelRating } from '../lib/rating.js'
import FavoriteButton from './FavoriteButton.jsx'

export default function GameCard({ game, warna }) {
  return (
    <div className="kartu-wrap">
      <Link to={`/game/${game.id}`} className="game-card">
        <Cover game={game} warna={warna} />
        <div className="game-info">
          <h3>{game.title}</h3>
          <p className="meta">{game.developer}, {game.year}</p>
          <p className="rating">{labelRating(game)}</p>
        </div>
      </Link>
      <FavoriteButton gameId={game.id} className="di-kartu" />
    </div>
  )
}
