insert into public.branches (id, name, location, address, whatsapp_number, phone, latitude, longitude, is_active)
values
  ('00000000-0000-0000-0000-000000000101', 'Meyerton', 'Meyerton', '12 Kerk Street, Meyerton, 1961', '27821234567', '0161234567', -26.5597, 27.9994, true),
  ('00000000-0000-0000-0000-000000000102', 'Riversdale', 'Riversdale', '5 Main Road, Riversdale, 6670', '27827654321', '0287654321', -34.0944, 21.2586, true),
  ('00000000-0000-0000-0000-000000000103', 'Vanderbijlpark', 'Vanderbijlpark', '88 Frikkie Meyer Blvd, Vanderbijlpark, 1911', '27829876543', '0169876543', -26.7005, 27.8378, true)
on conflict (id) do nothing;

insert into public.categories (id, name, icon_name, sort_order)
values
  ('00000000-0000-0000-0000-000000000201', 'Groceries', 'ShoppingBasket', 1),
  ('00000000-0000-0000-0000-000000000202', 'Household', 'Home', 2),
  ('00000000-0000-0000-0000-000000000203', 'Cleaning', 'Sparkles', 3),
  ('00000000-0000-0000-0000-000000000204', 'Personal Care', 'HeartPulse', 4),
  ('00000000-0000-0000-0000-000000000205', 'Beverages', 'Coffee', 5)
on conflict (id) do nothing;

insert into public.products (id, name, description, price, category_id, image_url, expiry_date, is_special, stock_status)
values
  ('00000000-0000-0000-0000-000000000301', 'Jungle Oats 1kg', 'Classic rolled oats.', 39.99, '00000000-0000-0000-0000-000000000201', 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop', '2026-12-01', true, 'in_stock'),
  ('00000000-0000-0000-0000-000000000302', 'Handy Andy Multi-Purpose 750ml', 'Cream cleaner for household surfaces.', 29.99, '00000000-0000-0000-0000-000000000203', 'https://images.unsplash.com/photo-1585586723682-168e3b2a9370?w=400&h=400&fit=crop', null, true, 'in_stock'),
  ('00000000-0000-0000-0000-000000000303', 'Coke 2L', 'Coca-Cola Original Taste.', 22.99, '00000000-0000-0000-0000-000000000205', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop', '2026-05-01', false, 'low_stock')
on conflict (id) do nothing;

insert into public.product_branches (product_id, branch_id)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103')
on conflict (product_id, branch_id) do nothing;

insert into public.banners (id, branch_id, image_url, headline, subtext, link_type, link_id, bg_color, is_active, sort_order)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop', 'MASSIVE SAVINGS THIS WEEK', 'New stock just landed.', 'none', null, '#1B2B5B', true, 1)
on conflict (id) do nothing;
