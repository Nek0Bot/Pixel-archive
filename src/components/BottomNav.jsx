import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Game', icon: '🎮', end: true },
  { to: '/genre', label: 'Genre', icon: '🗂️' },
  { to: '/profile', label: 'Profil', icon: '👤' }
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'tab aktif' : 'tab')}>
          <span className="tab-icon" aria-hidden="true">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
