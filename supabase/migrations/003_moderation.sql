create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('post', 'comment', 'ai')),
  target_id text not null,
  content text,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz default now()
);

alter table public.content_reports enable row level security;

create policy "reports_insert_own" on public.content_reports
  for insert with check (auth.uid() = user_id);
