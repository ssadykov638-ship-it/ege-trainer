-- One-time migration for student visibility, analytics and safe account removal.
alter table public.profiles
  add column if not exists hidden_from_teacher boolean not null default false;
alter table public.profiles
  add column if not exists removed_from_teacher boolean not null default false;

drop policy if exists "profiles_teacher_update_students" on public.profiles;
create policy "profiles_teacher_update_students"
on public.profiles for update
using (public.is_teacher() and role = 'student')
with check (public.is_teacher() and role = 'student');

create or replace function public.remove_student_from_teacher(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'Only a teacher can remove a student';
  end if;
  update public.profiles
  set removed_from_teacher = true,
      hidden_from_teacher = true,
      updated_at = now()
  where id = target_user_id and role = 'student';
  if not found then
    raise exception 'Student account not found';
  end if;
end;
$$;
revoke all on function public.remove_student_from_teacher(uuid) from public, anon;
grant execute on function public.remove_student_from_teacher(uuid) to authenticated;

create or replace function public.delete_student_account(target_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  select public.remove_student_from_teacher(target_user_id);
$$;
revoke all on function public.delete_student_account(uuid) from public, anon, authenticated;

create or replace function public.restore_student_to_teacher(target_login text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'Only a teacher can restore a student';
  end if;
  update public.profiles
  set removed_from_teacher = false,
      hidden_from_teacher = false,
      updated_at = now()
  where lower(login) = lower(trim(target_login))
    and role = 'student';
  if not found then
    raise exception 'Student account not found';
  end if;
end;
$$;
revoke all on function public.restore_student_to_teacher(text) from public, anon;
grant execute on function public.restore_student_to_teacher(text) to authenticated;
grant update on public.profiles to authenticated;

