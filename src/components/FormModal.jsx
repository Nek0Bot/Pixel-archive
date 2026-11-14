import { useEffect, useRef } from 'react'

// Pop up untuk form (memakai elemen <dialog> bawaan). Isi form hanya dirender saat terbuka,
// sehingga isiannya otomatis kosong setiap kali dibuka lagi.
export default function FormModal({ open, judul, onTutup, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal form-modal"
      aria-label={judul}
      onCancel={(e) => { e.preventDefault(); onTutup() }}
      onClick={(e) => { if (e.target === ref.current) onTutup() }}
    >
      <div className="modal-kepala">
        <h2>{judul}</h2>
        <button type="button" className="tautan" onClick={onTutup} aria-label="Tutup">✕</button>
      </div>
      {open && children}
    </dialog>
  )
}
