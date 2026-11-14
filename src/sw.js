/* eslint-disable no-restricted-globals */
// Service worker manual (Modul 4), tanpa library Workbox.
// Daftar file hasil build disuntikkan oleh vite-plugin-pwa pada self.__WB_MANIFEST.

const VERSI = 'v2'
const CACHE_SHELL = `pixel-shell-${VERSI}`
const CACHE_RUNTIME = `pixel-runtime-${VERSI}`
const BATAS_RUNTIME = 120

const PRECACHE = ['/', ...self.__WB_MANIFEST.map((e) => '/' + String(typeof e === 'string' ? e : e.url).replace(/^\//, ''))]

// 1) INSTALL: simpan application shell
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

// 2) ACTIVATE: hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nama) => Promise.all(nama.filter((n) => n !== CACHE_SHELL && n !== CACHE_RUNTIME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

async function batasiCache(nama, maks) {
  const cache = await caches.open(nama)
  const kunci = await cache.keys()
  if (kunci.length > maks) await Promise.all(kunci.slice(0, kunci.length - maks).map((k) => cache.delete(k)))
}

// Stale-while-revalidate: tampilkan cache dulu, perbarui di latar belakang
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_RUNTIME)
  const tersimpan = await cache.match(request)
  const jaringan = fetch(request)
    .then((res) => {
      // type "opaque" = gambar lintas-origin tanpa CORS (misalnya Supabase Storage)
      if (res.ok || res.type === 'opaque') {
        cache.put(request, res.clone()).then(() => batasiCache(CACHE_RUNTIME, BATAS_RUNTIME))
      }
      return res
    })
    .catch(() => tersimpan)
  return tersimpan || jaringan
}

// Cache-first untuk aset statis berhash milik sendiri
async function cacheFirst(request) {
  const tersimpan = await caches.match(request)
  if (tersimpan) return tersimpan
  const res = await fetch(request)
  if (res.ok) (await caches.open(CACHE_RUNTIME)).put(request, res.clone())
  return res
}

// 3) FETCH
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Navigasi halaman: network-first, jika offline pakai app shell (index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match('/index.html')) || (await caches.match('/')))
    )
    return
  }

  // Aset milik sendiri (JS, CSS, ikon, manifest)
  if (url.origin === self.location.origin && !url.pathname.startsWith('/api')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Gambar Supabase Storage dan Google Fonts
  const gambarStorage = url.pathname.includes('/storage/v1/object/public/')
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
  if (gambarStorage || font) {
    event.respondWith(staleWhileRevalidate(request))
  }
  // Permintaan data Supabase (REST) tidak dicegat: offline ditangani IndexedDB (Dexie)
})
