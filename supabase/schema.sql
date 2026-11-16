-- Customer Management Portal - Supabase Schema
-- Run this in your Supabase SQL Editor

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_date date not null,
  case_time time,
  name text not null,
  phone text,
  address text,
  problem text,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.price_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric(10, 2) not null,
  base_cost numeric(10, 2),
  sales_unit text default 'piece',
  pieces_per_unit integer default 1,
  stock_pieces integer default 0,
  unit_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  price_item_id uuid references public.price_items (id) on delete set null,
  item_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  sales_unit text default 'piece',
  pieces_per_unit integer default 1,
  unit_description text,
  created_at timestamptz not null default now()
);

-- Keep existing databases in sync (safe to re-run)
alter table public.customers add column if not exists case_time time;
alter table public.customers add column if not exists phone text;
alter table public.customers add column if not exists address text;
alter table public.customers add column if not exists problem text;
alter table public.customers add column if not exists total numeric(10, 2) not null default 0;
alter table public.customers add column if not exists updated_at timestamptz not null default now();

alter table public.price_items add column if not exists category text;
alter table public.price_items add column if not exists base_cost numeric(10, 2);
alter table public.price_items add column if not exists sales_unit text default 'piece';
alter table public.price_items add column if not exists pieces_per_unit integer default 1;
alter table public.price_items add column if not exists stock_pieces integer default 0;
alter table public.price_items add column if not exists unit_description text;
alter table public.price_items add column if not exists is_active boolean not null default true;

alter table public.customer_items add column if not exists sales_unit text default 'piece';
alter table public.customer_items add column if not exists pieces_per_unit integer default 1;
alter table public.customer_items add column if not exists unit_description text;

-- Stock history / movements log (safe to re-run)
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  price_item_id uuid references public.price_items (id) on delete set null,
  item_name text not null,
  movement_type text not null check (movement_type in ('in', 'out', 'adjustment', 'set', 'sale', 'initial')),
  quantity_delta integer not null default 0,
  quantity_before integer not null default 0,
  quantity_after integer not null default 0,
  note text,
  reference_id text,
  created_at timestamptz not null default now()
);

alter table public.stock_movements add column if not exists price_item_id uuid references public.price_items (id) on delete set null;
alter table public.stock_movements add column if not exists item_name text;
alter table public.stock_movements add column if not exists movement_type text;
alter table public.stock_movements add column if not exists quantity_delta integer default 0;
alter table public.stock_movements add column if not exists quantity_before integer default 0;
alter table public.stock_movements add column if not exists quantity_after integer default 0;
alter table public.stock_movements add column if not exists note text;
alter table public.stock_movements add column if not exists reference_id text;
alter table public.stock_movements add column if not exists created_at timestamptz default now();

create index if not exists idx_customer_items_customer
  on public.customer_items (customer_id);
create index if not exists idx_customers_date
  on public.customers (customer_date desc);
create index if not exists idx_stock_movements_item_date
  on public.stock_movements (price_item_id, created_at desc);
create index if not exists idx_stock_movements_created_at
  on public.stock_movements (created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- Enable Row Level Security and allow anon public access
alter table public.customers enable row level security;
alter table public.price_items enable row level security;
alter table public.customer_items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "Allow anon full access on customers" on public.customers;
create policy "Allow anon full access on customers" on public.customers for all using (true) with check (true);

drop policy if exists "Allow anon full access on price_items" on public.price_items;
create policy "Allow anon full access on price_items" on public.price_items for all using (true) with check (true);

drop policy if exists "Allow anon full access on customer_items" on public.customer_items;
create policy "Allow anon full access on customer_items" on public.customer_items for all using (true) with check (true);

drop policy if exists "Allow anon full access on stock_movements" on public.stock_movements;
create policy "Allow anon full access on stock_movements" on public.stock_movements for all using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Optional packaged item catalog seed
-- These match the built-in defaults used by the app. Existing rows are kept.
-- Run this block only if you want the packaged catalog stored in Supabase too.
-- ---------------------------------------------------------------------------
insert into public.price_items
  (id, name, category, price, base_cost, sales_unit, pieces_per_unit, stock_pieces, unit_description, is_active)
values
  ('10000000-0000-4000-8000-000000000001', 'Counter Fee (₹1 / 80 pieces)', 'Counter Fee', 80, 1, 'sheet', 80, 80, 'Full sheet of 80 pcs · ₹80 per sheet · sold as a whole sheet only', true),
  ('10000000-0000-4000-8000-000000000002', 'Counter Fee (₹2 / 160 pieces)', 'Counter Fee', 160, 2, 'sheet', 160, 160, 'Full sheet of 160 pcs · ₹160 per sheet · sold as a whole sheet only', true),
  ('10000000-0000-4000-8000-000000000003', 'Counter Fee (₹5 per piece)', 'Counter Fee', 5, 5, 'piece', 1, 0, 'Sold strictly per single piece · ₹5 per piece · no sheet unit', true),
  ('10000000-0000-4000-8000-000000000004', 'Counter Fee (₹20 per piece)', 'Counter Fee', 20, 20, 'piece', 1, 0, 'Sold strictly per single piece · ₹20 per piece · no sheet unit', true),
  ('10000000-0000-4000-8000-000000000005', 'Marriage Certificate / Stamp (2 pieces)', 'Marriage', 200, 0, 'pair', 2, 128, 'Sold per 2-pc unit · ₹200 for 2 pieces · price editable', true),
  ('10000000-0000-4000-8000-000000000006', 'Notary (₹450 Base)', 'Notary', 440, 450, 'sheet', 108, 108, '1 sheet = 108 pcs · ₹450 base · sold at ₹440 per sheet', true),
  ('10000000-0000-4000-8000-000000000007', 'Notary (₹900 Base)', 'Notary', 900, 900, 'sheet', 180, 180, '1 sheet = 180 pcs · ₹900 per sheet · auto price, editable', true)
on conflict (id) do nothing;
