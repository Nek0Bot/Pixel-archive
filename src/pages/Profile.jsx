import { useState } from 'react'
import useFavorites from '../hooks/useFavorites.js'
import { getUser, saveUser } from '../services/userService.js'

export default function Profile() {
  const { ids } = useFavorites()
  const [nama, setNama] = useState(getUser().name)
  const [tersimpan, setTersimpan] = useState(false)

  function simpan(e) {
    e.preventDefault()
    saveUser({ name: nama.trim() })
    setTersimpan(true)
  }

  return (
    <section className="halaman-profil">
      <h1 className="judul">Tentang Aplikasi</h1>
      <div className="kartu-profil">
        <div className="avatar">🕹️</div>
        <h2>Pixel Archive</h2>
        <p>Katalog game oleh para gamer. Telusuri berdasarkan judul atau genre, simpan favorit, tulis review, dan catat quote atau momen favoritmu.</p>
      </div>
      <dl className="info">
        <dt>Versi</dt><dd>{__APP_VERSION__}</dd>
        <dt>Teknologi</dt><dd>React, Vite, PWA (service worker manual), Supabase (PostgreSQL + Storage), IndexedDB (Dexie)</dd>
        <dt>Mata kuliah</dt><dd>Praktikum PPB Ganjil 2026</dd>
        <dt>Pembuat</dt><dd>Andhika Dhuta Pratama</dd>
        <dt>NIM</dt><dd>21120124130094</dd>
        <dt>Favorit</dt><dd>{ids.length} game</dd>
      </dl>
      <form className="form" onSubmit={simpan}>
        <label>Nama panggilan untuk review
          <input value={nama} onChange={(e) => { setNama(e.target.value); setTersimpan(false) }} maxLength={40} placeholder="Anonymous" />
        </label>
        <button className="tombol" type="submit">Simpan nama</button>
        {tersimpan && <p className="catatan" role="status">Nama tersimpan di perangkat ini.</p>}
      </form>
    </section>
  )
}
