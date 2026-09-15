-- EGE Trainer Supabase schema.
-- Run this in Supabase SQL Editor after creating the project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher')),
  name text not null,
  login text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_students (
  group_id uuid not null references public.groups(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, student_id)
);

create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  subject_id text not null,
  source_id text not null,
  variant_id text not null,
  subject_title text not null,
  source_title text not null,
  variant_title text not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (group_id, variant_id)
);

create table if not exists public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  variant_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, variant_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  homework_id uuid references public.homework(id) on delete set null,
  subject_title text not null,
  source_title text not null,
  variant_id text not null,
  variant_title text not null,
  score integer not null,
  total integer not null,
  attempt_mode text not null check (attempt_mode in ('practice', 'homework')),
  submitted_at timestamptz not null default now(),
  unique (user_id, variant_id, attempt_mode)
);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_students enable row level security;
alter table public.homework enable row level security;
alter table public.progress enable row level security;
alter table public.submissions enable row level security;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

drop policy if exists "profiles_select_self_or_teacher" on public.profiles;
create policy "profiles_select_self_or_teacher"
on public.profiles for select
using (id = auth.uid() or public.is_teacher());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "groups_select_authenticated" on public.groups;
create policy "groups_select_authenticated"
on public.groups for select
using (auth.role() = 'authenticated');

drop policy if exists "groups_teacher_write" on public.groups;
create policy "groups_teacher_write"
on public.groups for all
using (public.is_teacher())
with check (public.is_teacher());

drop policy if exists "group_students_select_self_or_teacher" on public.group_students;
create policy "group_students_select_self_or_teacher"
on public.group_students for select
using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "group_students_teacher_write" on public.group_students;
create policy "group_students_teacher_write"
on public.group_students for all
using (public.is_teacher())
with check (public.is_teacher());

drop policy if exists "homework_select_authenticated" on public.homework;
create policy "homework_select_authenticated"
on public.homework for select
using (auth.role() = 'authenticated');

drop policy if exists "homework_teacher_write" on public.homework;
create policy "homework_teacher_write"
on public.homework for all
using (public.is_teacher())
with check (public.is_teacher());

drop policy if exists "progress_select_self_or_teacher" on public.progress;
create policy "progress_select_self_or_teacher"
on public.progress for select
using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "progress_student_upsert_self" on public.progress;
create policy "progress_student_upsert_self"
on public.progress for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "submissions_select_self_or_teacher" on public.submissions;
create policy "submissions_select_self_or_teacher"
on public.submissions for select
using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "submissions_student_insert_self" on public.submissions;
create policy "submissions_student_insert_self"
on public.submissions for insert
with check (user_id = auth.uid());

drop policy if exists "submissions_student_update_self" on public.submissions;
create policy "submissions_student_update_self"
on public.submissions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into public.groups (id, title)
values ('00000000-0000-0000-0000-000000000001', 'Основная группа')
on conflict (id) do nothing;
