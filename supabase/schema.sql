-- NorteFlow — run once in Supabase: SQL Editor → New query → Run
-- Requires: Authentication → Providers → Email enabled (for sign up / sign in)

-- Tables
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  product text not null,
  quantity numeric not null,
  price numeric not null,
  total numeric not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  item text not null,
  category text not null default '',
  amount numeric not null,
  notes text not null default '',
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

drop trigger if exists income_set_updated_at on public.income;
create trigger income_set_updated_at
  before update on public.income
  for each row execute procedure public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.businesses enable row level security;
alter table public.income enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "businesses_select_own" on public.businesses;
create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = user_id);

drop policy if exists "businesses_insert_own" on public.businesses;
create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = user_id);

drop policy if exists "businesses_update_own" on public.businesses;
create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "businesses_delete_own" on public.businesses;
create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = user_id);

drop policy if exists "income_select_own" on public.income;
create policy "income_select_own"
  on public.income for select
  using (auth.uid() = user_id);

drop policy if exists "income_insert_own" on public.income;
create policy "income_insert_own"
  on public.income for insert
  with check (auth.uid() = user_id);

drop policy if exists "income_update_own" on public.income;
create policy "income_update_own"
  on public.income for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "income_delete_own" on public.income;
create policy "income_delete_own"
  on public.income for delete
  using (auth.uid() = user_id);

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own"
  on public.expenses for select
  using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own"
  on public.expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own"
  on public.expenses for delete
  using (auth.uid() = user_id);
