
CREATE TABLE public.menu_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read menu_pdfs" ON public.menu_pdfs FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert menu_pdfs" ON public.menu_pdfs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu_pdfs" ON public.menu_pdfs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete menu_pdfs" ON public.menu_pdfs FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('menu-pdfs', 'menu-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read menu-pdfs bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-pdfs');
CREATE POLICY "Authenticated can upload menu-pdfs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-pdfs');
CREATE POLICY "Authenticated can update menu-pdfs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-pdfs') WITH CHECK (bucket_id = 'menu-pdfs');
CREATE POLICY "Authenticated can delete menu-pdfs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-pdfs');

INSERT INTO public.menu_pdfs (name, file_name, sort_order) VALUES
  ('Appetizers — Khai Vị', 'Appetizers.pdf', 1),
  ('Noodle Soup — Phở', 'Noodle_Soup.pdf', 2),
  ('Beef Stew — Bò Kho', 'Stew.pdf', 3),
  ('Rice — Cơm', 'Rice.pdf', 4),
  ('Vermicelli — Bún', 'Vermicelli.pdf', 5),
  ('Vegetarian — Chay', 'Vegetarian.pdf', 6),
  ('Chef''s Special', 'Chef_s_Special.pdf', 7),
  ('Drinks & Desserts', 'Drinks_and_Desserts.pdf', 8);
