-- Branch-scoped public product feed.
-- Parameters:
--   :branch_id uuid

select
  p.id,
  p.name,
  p.description,
  p.price,
  p.category_id,
  p.image_url,
  p.expiry_date,
  p.is_special,
  p.stock_status,
  p.created_at,
  c.name as category_name,
  c.icon_name as category_icon_name
from public.products p
join public.product_branches pb on pb.product_id = p.id
join public.categories c on c.id = p.category_id
where pb.branch_id = :branch_id
order by c.sort_order asc, p.is_special desc, p.created_at desc;
