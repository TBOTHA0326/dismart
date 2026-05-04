-- Branch-scoped product search for the public storefront.
-- Parameters:
--   :branch_id uuid
--   :search text

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
  p.created_at
from public.products p
join public.product_branches pb on pb.product_id = p.id
join public.categories c on c.id = p.category_id
where pb.branch_id = :branch_id
and (
  p.name ilike '%' || :search || '%'
  or p.description ilike '%' || :search || '%'
  or c.name ilike '%' || :search || '%'
)
order by p.is_special desc, p.name asc;
