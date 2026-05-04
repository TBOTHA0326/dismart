-- CMS dashboard counts for a branch context.
-- Parameters:
--   :branch_id uuid

select
  count(distinct p.id) as active_products,
  count(distinct p.id) filter (where p.is_special) as specials,
  count(distinct p.id) filter (
    where p.expiry_date is not null
    and p.expiry_date <= current_date + interval '30 days'
  ) as expiring_soon,
  count(distinct b.id) filter (where b.is_active) as active_banners
from public.product_branches pb
join public.products p on p.id = pb.product_id
left join public.banners b on b.branch_id = pb.branch_id
where pb.branch_id = :branch_id;
