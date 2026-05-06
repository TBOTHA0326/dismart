-- Fix: branch managers blocked from creating/editing categories.
-- Categories are global (not branch-scoped), so branch managers can insert/update
-- but not delete (deleting could break other branches' products).

drop policy if exists "Admins manage categories" on public.categories;

create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Branch managers insert categories"
on public.categories for insert
with check (public.current_profile_role() = 'branch_manager');

create policy "Branch managers update categories"
on public.categories for update
using (public.current_profile_role() = 'branch_manager')
with check (public.current_profile_role() = 'branch_manager');
