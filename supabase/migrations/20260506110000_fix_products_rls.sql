-- Fix: branch managers were blocked from inserting/updating products.
-- The original with check only permitted admins to write.
-- Split into two policies:
--   Admins: full access, all operations.
--   Branch managers: can insert any product row (branch scoping is enforced
--     downstream by the product_branches RLS policy), and can update/delete
--     only products assigned to their branch.

drop policy if exists "CMS can manage products scoped by branch" on public.products;

create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Branch managers insert products"
on public.products for insert
with check (public.current_profile_role() = 'branch_manager');

create policy "Branch managers update own branch products"
on public.products for update
using (
  exists (
    select 1 from public.product_branches pb
    where pb.product_id = products.id
    and pb.branch_id = public.current_profile_branch_id()
  )
)
with check (public.current_profile_role() = 'branch_manager');

create policy "Branch managers delete own branch products"
on public.products for delete
using (
  exists (
    select 1 from public.product_branches pb
    where pb.product_id = products.id
    and pb.branch_id = public.current_profile_branch_id()
  )
);
