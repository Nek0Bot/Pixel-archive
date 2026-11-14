import { useEffect, useRef } from 'react'

// Dialog konfirmasi memakai elemen <dialog> bawaan browser (aksesibel, bisa ditutup dengan Esc).
export default function ConfirmModal({ open, judul, pesan, labelYa = 'Ya', onYa, onBatal }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="modal" onCancel={(e) => { e.preventDefault(); onBatal() }}>
      <h2>{judul}</h2>
      <p>{pesan}</p>
      <div className="aksi">
        <button className="tombol bahaya" onClick={onYa}>{labelYa}</button>
        <button className="tombol netral" onClick={onBatal}>Batal</button>
      </div>
    </dialog>
  )
}
