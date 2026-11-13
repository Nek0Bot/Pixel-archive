export default function Profile() {
  return (
    <section>
      <h1 className="judul">Tentang Aplikasi</h1>
      <div className="kartu-profil">
        <div className="avatar">🕹️</div>
        <h2>Pixel Archive</h2>
        <p>Katalog game indie dan retro. Telusuri game berdasarkan judul atau genre, lalu buka detailnya.</p>
      </div>
      <dl className="info">
        <dt>Versi</dt><dd>1.0.0</dd>
        <dt>Teknologi</dt><dd>React, Vite, PWA, Express API, PostgreSQL (Supabase)</dd>
        <dt>Mata kuliah</dt><dd>Praktikum PPB Ganjil 2026</dd>
        <dt>Pembuat</dt><dd>Andhika Dhuta Pratama</dd>
        <dt>NIM</dt><dd>21120124130094</dd>
      </dl>
    </section>
  )
}
