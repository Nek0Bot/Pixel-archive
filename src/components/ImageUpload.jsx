import { useState } from 'react'
import useOnline from '../hooks/useOnline.js'
import { uploadGambar, validasiGambar } from '../services/uploadService.js'

// Upload cover ke Supabase Storage, atau tempel URL gambar secara manual.
export default function ImageUpload({ value, onChange }) {
  const online = useOnline()
  const [naik, setNaik] = useState(false)
  const [galat, setGalat] = useState('')

  async function pilih(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const pesan = validasiGambar(file)
    if (pesan) return setGalat(pesan)
    setGalat('')
    setNaik(true)
    try {
      onChange(await uploadGambar(file))
    } catch (err) {
      setGalat(err.message)
    } finally {
      setNaik(false)
    }
  }

  return (
    <fieldset className="upload">
      <legend>Cover game</legend>
      {value && (
        <div className="upload-pratinjau">
          <img src={value} alt="Pratinjau cover" />
          <button type="button" className="tombol netral kecil" onClick={() => onChange('')}>Hapus gambar</button>
        </div>
      )}
      <label className="berkas">
        {naik ? 'Mengunggah...' : 'Pilih gambar (JPG, PNG, WebP, maks 2 MB)'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pilih} disabled={!online || naik} />
      </label>
      {!online && <p className="catatan">Offline: upload tidak tersedia. Kamu bisa menyimpan tanpa gambar atau memakai URL.</p>}
      <label>Atau tempel URL gambar
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      </label>
      {galat && <p className="state galat">{galat}</p>}
    </fieldset>
  )
}
