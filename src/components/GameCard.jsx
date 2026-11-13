import { Link } from 'react-router-dom'
import Cover from './Cover.jsx'

export default function GameCard({ game, warna }) {
  return (
    <Link to={`/game/${game.id}`} className="game-card">
      <Cover game={game} warna={warna} />
      <div className="game-info">
        <h3>{game.title}</h3>
        <p className="meta">{game.developer}, {game.year}</p>
        <p className="rating">★ {game.rating.toFixed(1)}</p>
      </div>
    </Link>
  )
}
