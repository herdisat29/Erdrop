alter table public.projects
add column if not exists email_notified boolean not null default false;
