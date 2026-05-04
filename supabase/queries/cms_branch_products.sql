-- CMS product list respecting the signed-in user's branch scope.
-- Admins can pass any branch_id; branch managers should pass their assigned branch_id.
-- Parameters:
--   :branch_id uuid

select
  p.*,
  array_agg(pb.branch_id) as branch_ids
from public.products p
join public.product_branches pb on pb.product_id = p.id
where pb.branch_id = :branch_id
group by p.id
order by p.updated_at desc;
