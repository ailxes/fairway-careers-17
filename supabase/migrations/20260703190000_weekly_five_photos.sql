-- Weekly Five photo fixes:
-- #4 Brand Ambassador & Content Creator (Malbon) had an off-topic image →
--    silhouette videographer at work (matches the content-creator role).
-- #5 Assistant Golf Professional (Scottsdale National) duplicated slot #1's
--    caddie photo → desert course with mountain backdrop (matches the venue).
UPDATE public.jobs
  SET photo_url = 'https://images.unsplash.com/photo-1576280314550-773c50583407?w=1200'
  WHERE id = '51b829bb-f9a3-4c15-b637-382e8671a50d';

UPDATE public.jobs
  SET photo_url = 'https://images.unsplash.com/photo-1671904942522-8e2a0dbb709f?w=1200'
  WHERE id = '70f52dc8-a07a-486e-a74c-ba56b109bb86';
