-- ============================================================
-- SEOzapp – Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles table (auto-populated on sign-up)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. SEO analyses table
create table if not exists public.seo_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  website text not null,
  seo_data jsonb,
  ai_visibility_data jsonb,
  ai_bot_data jsonb,
  loading_speed_data jsonb,
  created_at timestamptz default now()
);

alter table public.seo_analyses enable row level security;

create policy "Users can view own analyses"
  on public.seo_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.seo_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.seo_analyses for delete
  using (auth.uid() = user_id);

-- 3. Trigger: auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to avoid duplicate trigger errors
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
