update public.site_content set
  hero_eyebrow = replace(replace(hero_eyebrow,' — ',' - '),'—','-'),
  hero_story_line_1 = replace(replace(hero_story_line_1,' — ',' - '),'—','-'),
  hero_story_line_2 = replace(replace(hero_story_line_2,' — ',' - '),'—','-'),
  hero_story_line_3 = replace(replace(hero_story_line_3,' — ',' - '),'—','-'),
  hero_tagline = replace(replace(hero_tagline,' — ',' - '),'—','-'),
  story_body = replace(replace(story_body,' — ',' - '),'—','-'),
  story_tagline = replace(replace(story_tagline,' — ',' - '),'—','-'),
  story_pullquote = replace(replace(story_pullquote,' — ',' - '),'—','-'),
  contact_headline = replace(replace(contact_headline,' — ',' - '),'—','-'),
  contact_body = replace(replace(contact_body,' — ',' - '),'—','-'),
  limited_name = replace(replace(limited_name,' — ',' - '),'—','-'),
  limited_description = replace(replace(limited_description,' — ',' - '),'—','-'),
  limited_availability = replace(replace(limited_availability,' — ',' - '),'—','-'),
  hours = replace(replace(hours,' — ',' - '),'—','-'),
  address = replace(replace(address,' — ',' - '),'—','-');

update public.menu_sections set
  title = replace(replace(title,' — ',' - '),'—','-'),
  subtitle = replace(replace(subtitle,' — ',' - '),'—','-');

update public.menu_items set
  name = replace(replace(name,' — ',' - '),'—','-'),
  vn = replace(replace(vn,' — ',' - '),'—','-'),
  description = replace(replace(description,' — ',' - '),'—','-');

update public.gallery_images set
  alt = replace(replace(alt,' — ',' - '),'—','-'),
  caption = replace(replace(caption,' — ',' - '),'—','-');

update public.food_snaps set
  alt = replace(replace(alt,' — ',' - '),'—','-'),
  overlay_text = replace(replace(overlay_text,' — ',' - '),'—','-');

update public.menu_pdfs set name = replace(replace(name,' — ',' - '),'—','-');