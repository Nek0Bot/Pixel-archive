export default function State({ loading, error, children }) {
  if (loading) return <p className="state">Memuat data...</p>
  if (error) return <p className="state galat">{error}</p>
  return children
}
