// Pill filter genre + pilihan urutan (dipakai di Home).
export default function GenreFilter({ genres = [], aktif, onPilih, urutan, onUrutan }) {
  return (
    <div className="filter">
      <div className="pills" role="group" aria-label="Filter genre">
        <button className={`pill ${aktif === '' ? 'aktif' : ''}`} onClick={() => onPilih('')}>Semua</button>
        {genres.map((g) => (
          <button
            key={g.id}
            className={`pill ${aktif === g.id ? 'aktif' : ''}`}
            style={{ '--w': g.warna }}
            onClick={() => onPilih(aktif === g.id ? '' : g.id)}
          >
            {g.emoji} {g.nama}
          </button>
        ))}
      </div>
      <label className="urutan">Urutkan
        <select value={urutan} onChange={(e) => onUrutan(e.target.value)}>
          <option value="terbaru">Terbaru ditambah</option>
          <option value="judul">Judul A-Z</option>
          <option value="rating">Rating tertinggi</option>
          <option value="tahun">Tahun rilis terbaru</option>
        </select>
      </label>
    </div>
  )
}
