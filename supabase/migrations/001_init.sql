-- NariCare initial schema + RLS
create extension if not exists "pgcrypto";

create type diagnosis_status as enum ('diagnosed', 'suspect', 'unsure');
create type diet_preference as enum ('vegetarian', 'non_veg', 'eggetarian', 'vegan');
create type cuisine_preference as enum ('north_indian', 'south_indian', 'bengali', 'gujarati', 'pan_indian');
create type living_context as enum ('family_kitchen', 'hostel_mess', 'tiffin', 'eating_out');
create type phenotype as enum ('metabolic', 'androgenic', 'inflammatory', 'mixed');
create type lang as enum ('en', 'hi');
create type plan_type as enum ('monthly', 'annual');
create type sub_status as enum ('active', 'cancelled', 'expired', 'trial');
create type period_status as enum ('started', 'flowing', 'spotting', 'none');
create type community_category as enum ('diet_tips', 'success_stories', 'questions', 'emotional_support');

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  age int,
  height_cm int,
  weight_kg numeric,
  city text,
  diagnosis_status diagnosis_status,
  symptoms text[] default '{}',
  diet_preference diet_preference,
  allergies text[] default '{}',
  cuisine_preference cuisine_preference,
  living_context living_context default 'family_kitchen',
  goals text[] default '{}',
  language lang default 'en',
  phenotype phenotype default 'mixed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  razorpay_subscription_id text,
  plan_type plan_type not null,
  status sub_status not null,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  unique (user_id)
);

create table public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  period_status period_status default 'none',
  symptoms jsonb default '{}'::jsonb,
  weight_kg numeric,
  mood int check (mood between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  exercise_id text not null,
  duration_minutes int,
  completed boolean default true,
  created_at timestamptz default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  focus_done boolean default false,
  move_done boolean default false,
  unique (user_id, log_date)
);

create table public.meal_adherence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  meal_slot text not null,
  meal_id text not null,
  status text check (status in ('ate', 'swapped', 'skipped')),
  unique (user_id, log_date, meal_slot)
);

create table public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report_date date,
  image_url text,
  extracted_values jsonb default '{}'::jsonb,
  parsed_insights jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category community_category not null,
  title text not null,
  body text not null,
  is_anonymous boolean default true,
  upvote_count int default 0,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

create table public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  is_anonymous boolean default true,
  created_at timestamptz default now()
);

create table public.post_upvotes (
  user_id uuid references auth.users (id) on delete cascade,
  post_id uuid references public.community_posts (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

alter table public.user_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.habit_logs enable row level security;
alter table public.meal_adherence enable row level security;
alter table public.lab_reports enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.post_upvotes enable row level security;

create policy "profiles_own" on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "subscriptions_read_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "symptom_own" on public.symptom_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercise_own" on public.exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "habits_own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals_own" on public.meal_adherence
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "labs_own" on public.lab_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts_read" on public.community_posts for select to authenticated using (true);
create policy "posts_write_own" on public.community_posts
  for insert with check (auth.uid() = user_id);
create policy "posts_update_own" on public.community_posts
  for update using (auth.uid() = user_id);

create policy "comments_read" on public.community_comments for select to authenticated using (true);
create policy "comments_write_own" on public.community_comments
  for insert with check (auth.uid() = user_id);

create policy "upvotes_read" on public.post_upvotes for select to authenticated using (true);
create policy "upvotes_write_own" on public.post_upvotes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
