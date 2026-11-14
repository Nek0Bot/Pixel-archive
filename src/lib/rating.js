// Rating game = rata-rata review pengguna (dihitung otomatis oleh database).
export const adaRating = (game) => Number(game.rating) > 0
export const labelRating = (game) => (adaRating(game) ? `★ ${Number(game.rating).toFixed(1)}` : 'Belum ada rating')
