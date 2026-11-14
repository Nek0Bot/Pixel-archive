import { NavLink } from 'react-router-dom'
import useFavorites from '../hooks/useFavorites.js'

const tabs = [
  { to: '/', label: 'Game', icon: '🎮', end: true },
  { to: '/genre', label: 'Genre', icon: '🗂️' },
  { to: '/favorit', label: 'Favorit', icon: '♥', badge: true },
  { to: '/profile', label: 'Profil', icon: '👤' }
]

export default function BottomNav() {
  const { ids } = useFavorites()
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'tab aktif' : 'tab')}>
          <span className="tab-icon" aria-hidden="true">{t.icon}</span>
          <span>{t.label}{t.badge && ids.length > 0 ? ` (${ids.length})` : ''}</span>
        </NavLink>
      ))}
    </nav>
  )
}
