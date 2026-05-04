create table public.deal_pamphlets (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  title text not null,
  description text,
  asset_url text not null,
  asset_type text not null check (asset_type in ('image', 'pdf', 'external_url')),
  source text not null default 'upload' check (source in ('upload', 'image_url', 'facebook_url', 'other_url')),
  thumbnail_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deal_pamphlets_branch_order_idx
on public.deal_pamphlets(branch_id, sort_order)
where is_active = true;

alter table public.deal_pamphlets enable row level security;

create policy "Public can read active deal pamphlets"
on public.deal_pamphlets for select
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "CMS can manage branch deal pamphlets"
on public.deal_pamphlets for all
using (public.can_manage_branch(branch_id))
with check (public.can_manage_branch(branch_id));
