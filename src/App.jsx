import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import SyncStatus from './components/SyncStatus.jsx'
import Home from './pages/Home.jsx'
import GameDetail from './pages/GameDetail.jsx'
import Genres from './pages/Genres.jsx'
import GenreDetail from './pages/GenreDetail.jsx'
import GameForm from './pages/GameForm.jsx'
import Favorites from './pages/Favorites.jsx'
import PWABadge from './components/PWABadge.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <div className="app">
      <SyncStatus />
      <PWABadge />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/baru" element={<GameForm />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/game/:id/edit" element={<GameForm />} />
          <Route path="/genre" element={<Genres />} />
          <Route path="/genre/:id" element={<GenreDetail />} />
          <Route path="/favorit" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<p className="state">Halaman tidak ditemukan.</p>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
