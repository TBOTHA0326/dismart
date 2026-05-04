create extension if not exists "pgcrypto";

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  address text not null,
  whatsapp_number text not null,
  phone text not null,
  latitude numeric not null,
  longitude numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text not null default 'ShoppingBasket',
  icon_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category_id uuid not null references public.categories(id) on delete restrict,
  image_url text not null,
  expiry_date date,
  is_special boolean not null default false,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_branches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  unique (product_id, branch_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'branch_manager')),
  branch_id uuid references public.branches(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  image_url text not null,
  headline text not null,
  subtext text,
  link_type text not null default 'none' check (link_type in ('category', 'product', 'none')),
  link_id uuid,
  bg_color text not null default '#1B2B5B',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  source text not null check (source in ('whatsapp', 'web')),
  created_at timestamptz not null default now()
);

create index product_branches_branch_id_idx on public.product_branches(branch_id);
create index product_branches_product_id_idx on public.product_branches(product_id);
create index products_category_id_idx on public.products(category_id);
create index products_name_search_idx on public.products using gin (to_tsvector('english', name || ' ' || description));
create index banners_branch_order_idx on public.banners(branch_id, sort_order) where is_active = true;
create index categories_sort_order_idx on public.categories(sort_order);

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_profile_branch_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select branch_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

create or replace function public.can_manage_branch(target_branch_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin() or public.current_profile_branch_id() = target_branch_id
$$;

alter table public.branches enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_branches enable row level security;
alter table public.profiles enable row level security;
alter table public.banners enable row level security;
alter table public.enquiries enable row level security;

create policy "Public can read active branches"
on public.branches for select
using (is_active = true);

create policy "Admins manage branches"
on public.branches for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read categories"
on public.categories for select
using (true);

create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read products"
on public.products for select
using (true);

create policy "CMS can manage products scoped by branch"
on public.products for all
using (
  public.is_admin()
  or exists (
    select 1 from public.product_branches pb
    where pb.product_id = products.id
    and pb.branch_id = public.current_profile_branch_id()
  )
)
with check (public.is_admin());

create policy "Public can read product branches"
on public.product_branches for select
using (true);

create policy "CMS can manage product branch links"
on public.product_branches for all
using (public.can_manage_branch(branch_id))
with check (public.can_manage_branch(branch_id));

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "Admins manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active banners"
on public.banners for select
using (is_active = true);

create policy "CMS can manage branch banners"
on public.banners for all
using (public.can_manage_branch(branch_id))
with check (public.can_manage_branch(branch_id));

create policy "Public can create enquiries"
on public.enquiries for insert
with check (true);

create policy "CMS can read branch enquiries"
on public.enquiries for select
using (public.can_manage_branch(branch_id));
