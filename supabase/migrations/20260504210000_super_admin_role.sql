-- Expand role check to include super_admin
alter table public.profiles
  drop constraint profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'branch_manager'));

-- Helper: check if current user is super_admin
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'super_admin', false)
$$;

-- Update is_admin to include super_admin so existing admin checks still pass
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    public.current_profile_role() in ('admin', 'super_admin'),
    false
  )
$$;

-- Branch count guard: limit to 3 branches total (active or inactive).
-- Counting all rows enforces the subscription limit regardless of active status.
create or replace function public.check_branch_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.branches) >= 3 then
    raise exception 'Branch limit reached. Maximum 3 branches allowed.';
  end if;
  return new;
end;
$$;

create trigger enforce_branch_limit
  before insert on public.branches
  for each row
  execute function public.check_branch_limit();

-- Only super_admin can manage branches
drop policy if exists "Admins manage branches" on public.branches;

create policy "Super admins manage branches"
on public.branches for all
using (public.is_super_admin())
with check (public.is_super_admin());

-- Only super_admin can manage profiles with super_admin role.
-- For UPDATE: `using` checks existing row, `with check` checks new row.
-- This prevents admins from reading/updating super_admin profiles or elevating anyone to super_admin.
-- Side effect: is_admin() now returns true for super_admin, so super_admin can also manage product_branches (desired).
drop policy if exists "Admins manage profiles" on public.profiles;

create policy "Admins manage profiles"
on public.profiles for all
using (
  public.is_super_admin()
  or (
    public.is_admin()
    and role != 'super_admin'
  )
)
with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and role != 'super_admin'
  )
);
