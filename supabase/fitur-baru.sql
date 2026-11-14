-- =====================================================================
-- Pixel Archive: tambahan database untuk review, quote/momen, dan upload gambar
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run
-- Aman dijalankan ulang. Prasyarat: tabel games dan genres sudah ada.
-- =====================================================================

-- Kolom cover (jika belum ada)
ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 1. REVIEW ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id       BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id       TEXT   NOT NULL,                       -- id anonim dari localStorage
  reviewer_name TEXT   NOT NULL DEFAULT 'Anonim' CHECK (char_length(reviewer_name) <= 40),
  rating        INT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT   NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 500),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. QUOTE DAN MOMEN --------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id    BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  kind       TEXT   NOT NULL DEFAULT 'quote' CHECK (kind IN ('quote', 'momen')),
  content    TEXT   NOT NULL CHECK (char_length(content) BETWEEN 1 AND 600),
  source     TEXT   CHECK (source IS NULL OR char_length(source) <= 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_game ON reviews(game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_game  ON quotes(game_id, kind);

-- 3. RLS: akses baca, tambah, dan hapus untuk role anon (demo tanpa login) --
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "quotes_select" ON quotes;
DROP POLICY IF EXISTS "quotes_insert" ON quotes;
DROP POLICY IF EXISTS "quotes_delete" ON quotes;
CREATE POLICY "quotes_select" ON quotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "quotes_insert" ON quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "quotes_delete" ON quotes FOR DELETE TO anon, authenticated USING (true);

-- 4. STORAGE: bucket gambar (publik, maks 2 MB, hanya JPG/PNG/WebP) ---------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('game-images', 'game-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "game_images_select" ON storage.objects;
DROP POLICY IF EXISTS "game_images_insert" ON storage.objects;
CREATE POLICY "game_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'game-images');
CREATE POLICY "game_images_insert" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'game-images' AND (storage.foldername(name))[1] = 'covers');

-- 5. DATA CONTOH (opsional) -------------------------------------------------
INSERT INTO quotes (game_id, kind, content, source)
SELECT id, 'quote', 'Kamu bisa melakukannya.', 'Celeste, Bab 1' FROM games WHERE title = 'Celeste'
AND NOT EXISTS (SELECT 1 FROM quotes WHERE content = 'Kamu bisa melakukannya.');

INSERT INTO quotes (game_id, kind, content, source)
SELECT id, 'momen', 'Pertama kali melihat seluruh Hallownest terbentang dari menara pertama.', 'City of Tears'
FROM games WHERE title = 'Hollow Knight'
AND NOT EXISTS (SELECT 1 FROM quotes WHERE source = 'City of Tears');
