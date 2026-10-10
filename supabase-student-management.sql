-- One-time migration for student visibility, analytics and safe account deletion.
alter table public.profiles
  add column if not exists hidden_from_teacher boolean not null default false;
alter table public.profiles
  add column if not exists removed_from_teacher boolean not null default false;

drop policy if exists "profiles_teacher_update_students" on public.profiles;
create policy "profiles_teacher_update_students"
on public.profiles for update
using (public.is_teacher() and role = 'student')
with check (public.is_teacher() and role = 'student');

create or replace function public.delete_student_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_teacher() then
    raise exception 'Only a teacher can delete a student account';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = target_user_id and role = 'student'
  ) then
    raise exception 'Student account not found';
  end if;
  update public.profiles
  set removed_from_teacher = true,
      hidden_from_teacher = true,
      updated_at = now()
  where id = target_user_id and role = 'student';
end;
$$;

revoke all on function public.delete_student_account(uuid) from public, anon;
grant execute on function public.delete_student_account(uuid) to authenticated;
grant update on public.profiles to authenticated;

