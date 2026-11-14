import useTheme from '../hooks/useTheme.js'

export default function ThemeToggle() {
  const { tema, ganti } = useTheme()
  const gelap = tema === 'dark'
  return (
    <div className="bar-atas">
      <button type="button" className="tema-tombol" onClick={ganti} aria-pressed={gelap}>
        <span aria-hidden="true">{gelap ? '☀️' : '🌙'}</span> {gelap ? 'Mode terang' : 'Mode gelap'}
      </button>
    </div>
  )
}
