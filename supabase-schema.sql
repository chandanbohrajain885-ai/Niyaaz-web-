-- =====================================================================
-- NIYAAZ — Supabase schema (run once in Supabase → SQL Editor)
-- Then: Authentication → Users → "Add user" for each manager (email+password)
-- Then paste Project URL + anon key into data.js (supabaseUrl / supabaseAnonKey)
-- =====================================================================

create table if not exists public.niyaaz_records (
  id          text primary key,
  kind        text not null check (kind in ('order','reservation','catering','feedback','member','settings')),
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists niyaaz_records_kind_idx on public.niyaaz_records (kind, created_at desc);

alter table public.niyaaz_records enable row level security;

-- Public (website visitors): may only CREATE customer submissions. Cannot read, edit or delete anything.
drop policy if exists "public insert submissions" on public.niyaaz_records;
create policy "public insert submissions" on public.niyaaz_records
  for insert to anon
  with check (kind in ('order','reservation','catering','feedback','member')
              and octet_length(data::text) < 20000);

-- Public may read the settings row only (menu availability, prices, offers).
drop policy if exists "public read settings" on public.niyaaz_records;
create policy "public read settings" on public.niyaaz_records
  for select to anon using (id = 'settings');

-- Logged-in managers: full access.
drop policy if exists "staff full access" on public.niyaaz_records;
create policy "staff full access" on public.niyaaz_records
  for all to authenticated using (true) with check (true);

-- Order tracking for customers without exposing other orders:
create or replace function public.niyaaz_track_order(p_id text, p_last4 text)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'id', data->>'id', 'status', data->>'status', 'branch', data->>'branch',
    'total', data->'total', 'createdAt', data->>'createdAt', 'mode', data->>'mode')
  from public.niyaaz_records
  where id = p_id and kind = 'order' and right(coalesce(data->>'phone',''), 4) = p_last4
  limit 1;
$$;
grant execute on function public.niyaaz_track_order(text, text) to anon;

-- Royal Club balance (returns totals only — never order details)
create or replace function public.niyaaz_member(p_phone text)
returns jsonb language sql security definer set search_path = public as $$
  with o as (
    select coalesce((data->>'total')::numeric,0) as total, coalesce((data->>'pointsRedeemed')::int,0) as red
    from public.niyaaz_records
    where kind = 'order' and data->>'phone' = p_phone and coalesce(data->>'status','') <> 'cancelled'
  ), s as (select count(*) as n, coalesce(sum(total),0) as spend, coalesce(sum(floor(total/10)),0) as earned, coalesce(sum(red),0) as red from o)
  select jsonb_build_object(
    'phone', p_phone, 'orders', n, 'spend', spend,
    'tier', case when spend >= 15000 then 'Badshah' when spend >= 5000 then 'Nawab' else 'Shehzada' end,
    'points', greatest(0, floor(earned * case when spend >= 15000 then 1.5 when spend >= 5000 then 1.25 else 1 end) - red),
    'next', case when spend >= 15000 then 0 when spend >= 5000 then 15000 - spend else 5000 - spend end)
  from s;
$$;
grant execute on function public.niyaaz_member(text) to anon;
