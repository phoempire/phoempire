-- =========================================
-- TABLE 1: site_content (single row)
-- =========================================
CREATE TABLE public.site_content (
  id integer PRIMARY KEY DEFAULT 1,
  hero_tagline text NOT NULL,
  hero_eyebrow text NOT NULL,
  story_body text NOT NULL,
  story_tagline text NOT NULL,
  story_pullquote text NOT NULL,
  hours text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  email text NOT NULL,
  limited_name text NOT NULL,
  limited_description text NOT NULL,
  limited_availability text NOT NULL,
  limited_price text NOT NULL,
  limited_available boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_singleton CHECK (id = 1)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert site_content"
  ON public.site_content FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update site_content"
  ON public.site_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete site_content"
  ON public.site_content FOR DELETE
  TO authenticated USING (true);

INSERT INTO public.site_content (
  id, hero_tagline, hero_eyebrow, story_body, story_tagline, story_pullquote,
  hours, phone, address, email,
  limited_name, limited_description, limited_availability, limited_price, limited_available
) VALUES (
  1,
  'A fast-casual Vietnamese kitchen in Irving, Texas — serving phở, rice, and vermicelli the way it should taste.',
  'Fresh · Healthy · Vietnamese',
  'Phở Empire started with one simple belief — that great phở takes time, care, and a family recipe worth sharing. We''ve been serving Irving, Texas, and every bowl we serve comes from the same recipe we make at home.',
  'Come hungry. Leave like family.',
  'Every bowl starts with 12 hours of patience.',
  'Sunday – Saturday · 11:00 am – 9:00 pm',
  '(972) 594-7259',
  '3591 N. Belt Line Rd, Irving, TX 75062',
  'phoempire@yahoo.com',
  'Beef Rib Phở',
  'A towering braised short rib, slow-simmered until the meat slides off the bone, served over fresh rice noodles in our signature 12-hour beef broth. Finished with Thai basil, scallions, and a squeeze of lime.',
  'Available while supplies last — ask your server for tonight''s count.',
  '18.95',
  true
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- TABLE 2: ratings
-- =========================================
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key text NOT NULL UNIQUE,
  name text NOT NULL,
  rating numeric(3,1) NOT NULL,
  count integer NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read ratings"
  ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert ratings"
  ON public.ratings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update ratings"
  ON public.ratings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete ratings"
  ON public.ratings FOR DELETE TO authenticated USING (true);

INSERT INTO public.ratings (platform_key, name, rating, count, href, sort_order) VALUES
  ('google', 'Google', 4.4, 1252, 'https://www.google.com/maps/search/?api=1&query=Pho+Empire+Irving+TX', 1),
  ('yelp', 'Yelp', 3.9, 621, 'https://www.yelp.com/biz/pho-empire-irving', 2),
  ('tripadvisor', 'TripAdvisor', 4.1, 49, 'https://www.tripadvisor.com/Restaurant_Review-g56032-d786775-Reviews-Pho_Empire-Irving_Texas.html', 3),
  ('ubereats', 'Uber Eats', 4.8, 900, 'https://www.ubereats.com/store/pho-empire-irving/MVWD2k0nV7yY8gKNz69gWQ', 4),
  ('doordash', 'DoorDash', 4.7, 500, 'https://www.doordash.com/store/pho-empire-irving-28013554/', 5),
  ('grubhub', 'Grubhub', 4.4, 188, 'https://www.grubhub.com/restaurant/pho-empire-3591-n-belt-line-rd-irving/5912584', 6),
  ('beli', 'Beli', 8.6, 40, 'https://app.beliapp.com/search?q=Pho%20Empire%20Irving', 7);

-- =========================================
-- TABLE 3: gallery_images
-- =========================================
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot integer NOT NULL UNIQUE,
  src_path text NOT NULL,
  alt text NOT NULL,
  caption text NOT NULL,
  rotate_class text,
  grid_class text NOT NULL
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read gallery_images"
  ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert gallery_images"
  ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update gallery_images"
  ON public.gallery_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete gallery_images"
  ON public.gallery_images FOR DELETE TO authenticated USING (true);

INSERT INTO public.gallery_images (slot, src_path, alt, caption, rotate_class, grid_class) VALUES
  (1, 'menu-pho.jpg',    'Phở Empire — steaming bowl with eye-of-round, flank, tendon and meatballs', 'Phở Empire',   '-rotate-2', 'md:col-start-1 md:col-span-4 md:row-start-1 md:row-span-6 aspect-[4/5]'),
  (2, 'menu-bun.jpg',    'Bún Đặc Biệt — vermicelli combo with grilled meats and egg roll',           'Bún Đặc Biệt',  NULL,        'md:col-start-5 md:col-span-4 md:row-start-2 md:row-span-4 aspect-[4/3]'),
  (3, 'menu-banhmi.jpg', 'Bánh Mì — crispy French bread with grilled pork and pickled vegetables',    'Bánh Mì',       'rotate-2',  'md:col-start-9 md:col-span-4 md:row-start-1 md:row-span-5 aspect-[4/5]'),
  (4, 'menu-goicuon.jpg','Gỏi Cuốn — fresh spring rolls with shrimp and peanut sauce',                'Gỏi Cuốn',      NULL,        'md:col-start-3 md:col-span-4 md:row-start-7 md:row-span-5 aspect-[4/3]'),
  (5, 'menu-com.jpg',    'Cơm Empire — combo steamed rice with grilled pork chop, chicken and fried egg', 'Cơm Empire', '-rotate-1', 'md:col-start-8 md:col-span-4 md:row-start-6 md:row-span-5 aspect-[4/5]');

-- =========================================
-- TABLE 4: menu_sections
-- =========================================
CREATE TABLE public.menu_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  sort_order integer NOT NULL
);

ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read menu_sections"
  ON public.menu_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert menu_sections"
  ON public.menu_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu_sections"
  ON public.menu_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete menu_sections"
  ON public.menu_sections FOR DELETE TO authenticated USING (true);

INSERT INTO public.menu_sections (section_key, title, subtitle, sort_order) VALUES
  ('pho-bo',   'Phở Bò — Beef Noodle Soup',          'Fresh rice noodles in beef broth with green onion, cilantro, and onion. Served with bean sprouts, jalapeño, lime, and basil. Regular 10.99 · Large 12.49 · X-Large 13.79', 1),
  ('pho-ga',   'Phở Gà — Chicken Noodle Soup',       'Hearty chicken broth with your choice of cut. Regular 10.99 · Large 12.49 · X-Large 13.79', 2),
  ('com',      'Cơm — Rice',                          NULL, 3),
  ('bun',      'Bún — Vermicelli',                    'Most bowls 12.95', 4),
  ('banh-hoi', 'Bánh Hỏi — Woven Fine Vermicelli',   '$15.85 · Extra rice paper +$1.99', 5),
  ('chay',     'Vegetarian — Chay',                   'Most dishes 12.95 – 13.49', 6),
  ('khai-vi',  'Khai Vị — Appetizers',                NULL, 7),
  ('banh-mi',  'Bánh Mì — French Bread',              'All sandwiches $5.99', 8),
  ('chef',     'Chef''s Special',                     'Most dishes 12.99 – 13.99', 9),
  ('kid',      'Kid''s Meal',                         'All $7.99', 10),
  ('drinks',   'Drinks & Desserts',                   NULL, 11);

-- =========================================
-- TABLE 5: menu_items
-- =========================================
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL REFERENCES public.menu_sections(section_key) ON UPDATE CASCADE ON DELETE CASCADE,
  name text NOT NULL,
  vn text,
  price text,
  description text,
  sort_order integer NOT NULL
);

CREATE INDEX idx_menu_items_section_key ON public.menu_items(section_key);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read menu_items"
  ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert menu_items"
  ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu_items"
  ON public.menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete menu_items"
  ON public.menu_items FOR DELETE TO authenticated USING (true);

INSERT INTO public.menu_items (section_key, name, vn, price, description, sort_order) VALUES
  -- pho-bo
  ('pho-bo', 'Phở Empire', 'PE', '11.55 / 12.95 / 13.95', 'Eye-of-round, beef flank, crunchy fat, soft tendon, tripe, and meatballs.', 1),
  ('pho-bo', 'Eye-of-round, flank, fat, tendon & tripe', 'Phở Tái Nạm Gầu Gân Sách', NULL, NULL, 2),
  ('pho-bo', 'Eye-of-round & chewy beef flank', 'Phở Tái Nạm', NULL, NULL, 3),
  ('pho-bo', 'Beef Stew with Noodle Soup', 'Phở Bò Kho', '12.95', NULL, 4),
  -- pho-ga
  ('pho-ga', 'Empire Chicken Phở', 'Phở Gà Empire', '11.55 / 12.95 / 13.95', 'Shredded breast, thigh, vegetables, and quail eggs.', 1),
  ('pho-ga', 'Classic Chicken Noodle Soup', 'Phở Gà Truyền Thống', NULL, NULL, 2),
  ('pho-ga', 'Chicken Breast Noodle Soup', 'Phở Gà Thịt Trắng', NULL, NULL, 3),
  ('pho-ga', 'Tofu Phở in Chicken Broth', 'Phở Đậu Hủ Với Súp Gà', NULL, NULL, 4),
  -- com
  ('com', 'Cơm Empire', 'Combo Steamed Rice', '16.99', 'Shredded pork skin, grilled pork chop, grilled pork, grilled chicken, pork cake, and fried egg.', 1),
  ('com', 'Roasted Cornish Hen on Golden Rice', 'Cơm Gà Xối Mỡ', '13.95', NULL, 2),
  ('com', 'Dancing Cupid Beef on Steamed Rice', 'Cơm Bò Lúc Lắc', '13.99', NULL, 3),
  ('com', 'Grilled Salmon on Steamed Rice', 'Cơm Cá Hồi Nướng', '16.99', NULL, 4),
  ('com', 'Pineapple Fried Rice — beef, chicken, or shrimp', 'Cơm Chiên Thơm', '13.45', NULL, 5),
  -- bun
  ('bun', 'Vermicelli Combo', 'Bún Đặc Biệt', '16.99', 'Shredded pork skin, BBQ pork, charbroiled chicken, charbroiled shrimp, and egg roll.', 1),
  ('bun', 'Charbroiled Shrimp & BBQ Pork', 'Bún Tôm Thịt Nướng', NULL, NULL, 2),
  ('bun', 'Shredded Pork Skin & Egg Rolls', 'Bún Bì Chả Giò', NULL, NULL, 3),
  ('bun', 'Beef & Onion Sautéed', 'Bún Bò Xào Củ Hành', NULL, NULL, 4),
  -- banh-hoi
  ('banh-hoi', 'With Grilled Meatball', 'Bánh Hỏi Nem Nướng', NULL, NULL, 1),
  ('banh-hoi', 'Shrimp Paste & Grilled Meatball', 'Bánh Hỏi Chạo Tôm Nem Nướng', NULL, NULL, 2),
  ('banh-hoi', 'Grilled Pork & Grilled Meatball', 'Bánh Hỏi Thịt Nướng Nem Nướng', NULL, NULL, 3),
  ('banh-hoi', 'Grilled Chicken', 'Bánh Hỏi Gà Nướng', NULL, NULL, 4),
  -- chay
  ('chay', 'Vegetarian Rice Noodle Soup', 'Hủ Tiếu Chay', NULL, NULL, 1),
  ('chay', 'Tofu Sautéed with Vegetables on Rice', 'Cơm Tàu Hủ Xào Rau', NULL, NULL, 2),
  ('chay', 'Fried Tofu Vermicelli Bowl', 'Bún Đậu Hủ Chiên', NULL, NULL, 3),
  ('chay', 'Crispy Egg Noodle with Tofu & Veg', 'Mì Xào Dòn Chay', '13.49', NULL, 4),
  -- khai-vi
  ('khai-vi', 'Combo Appetizers', 'Spring roll, egg roll, breaded shrimp & calamari', '15.99', NULL, 1),
  ('khai-vi', 'Egg Rolls (2)', 'Chả Giò', '4.25', NULL, 2),
  ('khai-vi', 'Fresh Spring Rolls', 'Gỏi Cuốn', '4.25', NULL, 3),
  ('khai-vi', 'Shrimp Paste Spring Rolls (2)', 'Chạo Tôm Cuốn', '4.99', NULL, 4),
  ('khai-vi', 'Beef Jerky Papaya Salad', 'Gỏi Đu Đủ Khô Bò', '5.25', NULL, 5),
  -- banh-mi
  ('banh-mi', 'Grilled Pork', 'Bánh Mì Thịt Nướng', NULL, NULL, 1),
  ('banh-mi', 'Grilled Chicken', 'Bánh Mì Gà Nướng', NULL, NULL, 2),
  ('banh-mi', 'Grilled Beef', 'Bánh Mì Bò Nướng', NULL, NULL, 3),
  ('banh-mi', 'Sunny-Side Egg', 'Bánh Mì Trứng Ốp La', NULL, NULL, 4),
  ('banh-mi', 'Vietnamese Ham', 'Bánh Mì Chả Lụa', NULL, NULL, 5),
  ('banh-mi', 'Fried Tofu', 'Bánh Mì Đậu Hủ', NULL, NULL, 6),
  -- chef
  ('chef', 'Spicy Huế Beef Noodle Soup', 'Bún Bò Huế', NULL, 'Lemongrass-flavored, beef shank, pork ham, and herbs.', 1),
  ('chef', 'Crystal Noodle Soup', 'Hủ Tiếu Mỹ Tho', NULL, NULL, 2),
  ('chef', 'Pan-fried Flat Noodle', 'Phở Áp Chảo', '13.99', NULL, 3),
  ('chef', 'Wonton Soup', 'Hoành Thánh Súp', '10.99', NULL, 4),
  ('chef', 'Wet Cake — Special', 'Bánh Ướt Đặc Biệt', NULL, NULL, 5),
  -- kid
  ('kid', 'Noodle Soup with Brisket', 'Phở Tái Chín', NULL, NULL, 1),
  ('kid', 'Steamed Rice with BBQ Pork or Grilled Chicken', 'Cơm Thịt Nướng', NULL, NULL, 2),
  ('kid', 'Fried Seafood Rice', 'Cơm Đồ Biển Chiên', NULL, NULL, 3),
  -- drinks
  ('drinks', 'Empire Coffee', 'Drip coffee, condensed milk, whipped cream, boba & wafer', '5.99', NULL, 1),
  ('drinks', 'Boba Coffee', 'Iced milk coffee with boba', '4.50', NULL, 2),
  ('drinks', 'Boba Tea — Thai, Green, Taro, Mango, Passion Fruit & more', NULL, '4.99', NULL, 3),
  ('drinks', 'Combination Bean Pudding', 'Chè Đặc Biệt', '5.99', NULL, 4),
  ('drinks', 'Young Coconut Juice', 'Nước Dừa', '4.50', NULL, 5);

-- =========================================
-- STORAGE: pho-empire-images bucket (public)
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pho-empire-images', 'pho-empire-images', true);

CREATE POLICY "Public can read pho-empire-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pho-empire-images');

CREATE POLICY "Authenticated can upload pho-empire-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pho-empire-images');

CREATE POLICY "Authenticated can update pho-empire-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pho-empire-images')
  WITH CHECK (bucket_id = 'pho-empire-images');

CREATE POLICY "Authenticated can delete pho-empire-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pho-empire-images');