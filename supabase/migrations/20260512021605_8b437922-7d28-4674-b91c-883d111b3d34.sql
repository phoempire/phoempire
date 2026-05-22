
-- Add new columns to site_content
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS hero_image_path text,
  ADD COLUMN IF NOT EXISTS hero_story_line_1 text NOT NULL DEFAULT '12 hours of simmering.',
  ADD COLUMN IF NOT EXISTS hero_story_line_2 text NOT NULL DEFAULT 'One family recipe.',
  ADD COLUMN IF NOT EXISTS hero_story_line_3 text NOT NULL DEFAULT 'Every single bowl.',
  ADD COLUMN IF NOT EXISTS story_image_path text,
  ADD COLUMN IF NOT EXISTS menu_herbs_image_path text,
  ADD COLUMN IF NOT EXISTS contact_headline text NOT NULL DEFAULT 'Catering, parties, questions.',
  ADD COLUMN IF NOT EXISTS contact_body text NOT NULL DEFAULT 'Reach us for reservations, menu questions, or catering';

UPDATE public.site_content
SET hero_story_line_1 = '12 hours of simmering.',
    hero_story_line_2 = 'One family recipe.',
    hero_story_line_3 = 'Every single bowl.',
    contact_headline = 'Catering, parties, questions.',
    contact_body = 'Reach us for reservations, menu questions, or catering — call (972) 594-7259 or email phoempire@yahoo.com.'
WHERE id = 1;

-- food_snaps table
CREATE TABLE IF NOT EXISTS public.food_snaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot integer NOT NULL UNIQUE,
  image_path text,
  overlay_text text NOT NULL,
  alt text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.food_snaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read food_snaps"
  ON public.food_snaps FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert food_snaps"
  ON public.food_snaps FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update food_snaps"
  ON public.food_snaps FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete food_snaps"
  ON public.food_snaps FOR DELETE TO authenticated
  USING (true);

INSERT INTO public.food_snaps (slot, overlay_text, alt, sort_order) VALUES
  (1, 'Fresh herbs. Every time.', 'Fresh herbs and broth', 1),
  (2, 'Slow-simmered. Never rushed.', 'Bowl of pho', 2),
  (3, 'Irving''s table since 2008.', 'Restaurant interior', 3)
ON CONFLICT (slot) DO NOTHING;
