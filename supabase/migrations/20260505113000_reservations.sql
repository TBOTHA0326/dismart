alter table public.products
  add column if not exists stock_quantity int not null default 0,
  add column if not exists reserved_quantity int not null default 0;

update public.products
set stock_quantity = 24
where stock_quantity = 0
  and stock_status != 'out_of_stock';

alter table public.products
  add constraint products_stock_quantity_non_negative
  check (stock_quantity >= 0);

alter table public.products
  add constraint products_reserved_quantity_non_negative
  check (reserved_quantity >= 0);

alter table public.products
  add constraint products_reserved_quantity_lte_stock_quantity
  check (reserved_quantity <= stock_quantity);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  quantity int not null check (quantity > 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  customer_name text not null,
  whatsapp_number text not null,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'CONTACTED', 'CONFIRMED', 'COLLECTED', 'EXPIRED', 'CANCELLED', 'NOT_COLLECTED')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_branch_status_idx on public.reservations(branch_id, status, expires_at);
create index reservations_product_id_idx on public.reservations(product_id);
create index reservations_expires_at_idx on public.reservations(expires_at)
  where status in ('PENDING', 'CONTACTED', 'CONFIRMED');

alter table public.reservations enable row level security;

create policy "CMS can read branch reservations"
on public.reservations for select
using (public.can_manage_branch(branch_id));

create policy "CMS can update branch reservations"
on public.reservations for update
using (public.can_manage_branch(branch_id))
with check (public.can_manage_branch(branch_id));

create or replace function public.create_reservation(
  target_product_id uuid,
  target_branch_id uuid,
  reserve_quantity int,
  customer_name text,
  whatsapp_number text,
  expires_at timestamptz
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reserved_row public.reservations;
  product_price numeric(10, 2);
begin
  if reserve_quantity is null or reserve_quantity <= 0 then
    raise exception 'Quantity must be greater than zero.';
  end if;

  if nullif(trim(customer_name), '') is null then
    raise exception 'Customer name is required.';
  end if;

  if nullif(trim(whatsapp_number), '') is null then
    raise exception 'WhatsApp number is required.';
  end if;

  if expires_at is null or expires_at <= now() then
    raise exception 'Reservation expiry must be in the future.';
  end if;

  if not exists (
    select 1
    from public.product_branches pb
    join public.branches b on b.id = pb.branch_id
    where pb.product_id = target_product_id
      and pb.branch_id = target_branch_id
      and b.is_active = true
  ) then
    raise exception 'Product is not available at this branch.';
  end if;

  update public.products
  set reserved_quantity = reserved_quantity + reserve_quantity,
      updated_at = now()
  where id = target_product_id
    and stock_quantity - reserved_quantity >= reserve_quantity
  returning price into product_price;

  if product_price is null then
    raise exception 'Not enough stock available.';
  end if;

  insert into public.reservations (
    product_id,
    branch_id,
    quantity,
    total_price,
    customer_name,
    whatsapp_number,
    status,
    expires_at
  )
  values (
    target_product_id,
    target_branch_id,
    reserve_quantity,
    product_price * reserve_quantity,
    trim(customer_name),
    trim(whatsapp_number),
    'PENDING',
    expires_at
  )
  returning * into reserved_row;

  return reserved_row;
end;
$$;

grant execute on function public.create_reservation(uuid, uuid, int, text, text, timestamptz) to anon, authenticated;

create or replace function public.update_reservation_status(
  target_reservation_id uuid,
  next_status text
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_row public.reservations;
  old_status text;
  active_statuses text[] := array['PENDING', 'CONTACTED', 'CONFIRMED'];
  release_statuses text[] := array['EXPIRED', 'CANCELLED', 'NOT_COLLECTED'];
begin
  if next_status not in ('PENDING', 'CONTACTED', 'CONFIRMED', 'COLLECTED', 'EXPIRED', 'CANCELLED', 'NOT_COLLECTED') then
    raise exception 'Invalid reservation status.';
  end if;

  select *
  into reservation_row
  from public.reservations
  where id = target_reservation_id
  for update;

  if reservation_row.id is null then
    raise exception 'Reservation not found.';
  end if;

  if not public.can_manage_branch(reservation_row.branch_id) then
    raise exception 'Forbidden.';
  end if;

  old_status := reservation_row.status;

  if old_status = next_status then
    return reservation_row;
  end if;

  if old_status = any(active_statuses) and next_status = 'COLLECTED' then
    update public.products
    set stock_quantity = stock_quantity - reservation_row.quantity,
        reserved_quantity = reserved_quantity - reservation_row.quantity,
        updated_at = now()
    where id = reservation_row.product_id
      and stock_quantity >= reservation_row.quantity
      and reserved_quantity >= reservation_row.quantity;

    if not found then
      raise exception 'Could not complete collection stock adjustment.';
    end if;
  elsif old_status = any(active_statuses) and next_status = any(release_statuses) then
    update public.products
    set reserved_quantity = reserved_quantity - reservation_row.quantity,
        updated_at = now()
    where id = reservation_row.product_id
      and reserved_quantity >= reservation_row.quantity;

    if not found then
      raise exception 'Could not release reserved stock.';
    end if;
  elsif not (old_status = any(active_statuses)) and next_status = any(active_statuses) then
    update public.products
    set reserved_quantity = reserved_quantity + reservation_row.quantity,
        updated_at = now()
    where id = reservation_row.product_id
      and stock_quantity - reserved_quantity >= reservation_row.quantity;

    if not found then
      raise exception 'Not enough stock available to reactivate reservation.';
    end if;
  end if;

  update public.reservations
  set status = next_status,
      updated_at = now()
  where id = target_reservation_id
  returning * into reservation_row;

  return reservation_row;
end;
$$;

grant execute on function public.update_reservation_status(uuid, text) to authenticated;

create or replace function public.expire_stale_reservations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count int;
begin
  with expired as (
    update public.reservations
    set status = 'EXPIRED',
        updated_at = now()
    where status in ('PENDING', 'CONTACTED', 'CONFIRMED')
      and expires_at < now()
    returning product_id, quantity
  ),
  totals as (
    select product_id, sum(quantity)::int as quantity
    from expired
    group by product_id
  ),
  restored as (
    update public.products p
    set reserved_quantity = greatest(0, p.reserved_quantity - t.quantity),
        updated_at = now()
    from totals t
    where p.id = t.product_id
    returning t.product_id
  )
  select count(*) into expired_count from expired;

  return coalesce(expired_count, 0);
end;
$$;
