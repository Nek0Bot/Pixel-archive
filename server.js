import app from './api/index.js'
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Pixel Archive API berjalan di http://localhost:${PORT}/api`))
