-- Active branch-scoped deals, pamphlets, PDFs and social deal links.
-- Parameters:
--   :branch_id uuid

select
  id,
  branch_id,
  title,
  description,
  asset_url,
  asset_type,
  source,
  thumbnail_url,
  starts_at,
  ends_at,
  sort_order
from public.deal_pamphlets
where branch_id = :branch_id
and is_active = true
and (starts_at is null or starts_at <= now())
and (ends_at is null or ends_at >= now())
order by sort_order asc, created_at desc;
