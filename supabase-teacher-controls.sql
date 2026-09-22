-- One-time migration for teacher enrollment controls.
-- It does not delete profiles, progress, homework or submissions.
grant delete on public.group_students to authenticated;
