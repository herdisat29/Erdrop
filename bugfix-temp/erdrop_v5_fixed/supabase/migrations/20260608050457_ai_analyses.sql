create table public.ai_analyses (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    potential_score integer not null,
    summary text not null,
    red_flags text[] not null default '{}',
    green_flags text[] not null default '{}',
    recommendation text not null,
    reasoning text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set up RLS
alter table public.ai_analyses enable row level security;

create policy "Users can view ai_analyses of their projects"
    on public.ai_analyses for select
    using ( exists (
        select 1 from public.projects
        where projects.id = ai_analyses.project_id
        and projects.user_id = auth.uid()
    ) );

create policy "Users can insert ai_analyses to their projects"
    on public.ai_analyses for insert
    with check ( exists (
        select 1 from public.projects
        where projects.id = ai_analyses.project_id
        and projects.user_id = auth.uid()
    ) );

create policy "Users can update ai_analyses of their projects"
    on public.ai_analyses for update
    using ( exists (
        select 1 from public.projects
        where projects.id = ai_analyses.project_id
        and projects.user_id = auth.uid()
    ) );

create policy "Users can delete ai_analyses of their projects"
    on public.ai_analyses for delete
    using ( exists (
        select 1 from public.projects
        where projects.id = ai_analyses.project_id
        and projects.user_id = auth.uid()
    ) );
