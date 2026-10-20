-- ========================================================
-- MY STICKERZ ENSEIGNE — SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor (1 Click)
-- ========================================================

-- 1. ORDERS TABLE
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    order_number text unique not null,
    customer jsonb not null default '{}'::jsonb,
    items jsonb not null default '[]'::jsonb,
    subtotal numeric(10,2) default 0,
    shipping numeric(10,2) default 0,
    total numeric(10,2) not null default 0,
    payment_method text default 'standard',
    status text default 'Pending BAT',
    created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- Policies for Orders
drop policy if exists "Allow public insert to orders" on public.orders;
create policy "Allow public insert to orders"
    on public.orders for insert
    with check (true);

drop policy if exists "Allow public select orders" on public.orders;
create policy "Allow public select orders"
    on public.orders for select
    using (true);

drop policy if exists "Allow public update orders" on public.orders;
create policy "Allow public update orders"
    on public.orders for update
    using (true)
    with check (true);

-- 2. CONTACT MESSAGES TABLE
create table if not exists public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text,
    subject text,
    message text not null,
    created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Allow public insert to contact_messages" on public.contact_messages;
create policy "Allow public insert to contact_messages"
    on public.contact_messages for insert
    with check (true);

drop policy if exists "Allow public select contact_messages" on public.contact_messages;
create policy "Allow public select contact_messages"
    on public.contact_messages for select
    using (true);

-- 3. NEWSLETTER SUBSCRIBERS TABLE
create table if not exists public.newsletter_subscribers (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    subscribed_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Allow public insert to newsletter_subscribers" on public.newsletter_subscribers;
create policy "Allow public insert to newsletter_subscribers"
    on public.newsletter_subscribers for insert
    with check (true);

drop policy if exists "Allow public select newsletter_subscribers" on public.newsletter_subscribers;
create policy "Allow public select newsletter_subscribers"
    on public.newsletter_subscribers for select
    using (true);

-- 4. INSERT INITIAL SEED ORDER (For Testing Admin Portal)
insert into public.orders (order_number, customer, items, subtotal, shipping, total, payment_method, status)
values (
    'MSE-DEMO-01',
    '{"firstName": "Jean", "lastName": "Dupont", "email": "contact@sainthonore.fr", "phone": "06 12 34 56 78", "city": "Paris", "address": "12 Rue Saint-Honoré", "country": "France"}'::jsonb,
    '[{"name": "Custom Cut PVC Letters 3D", "quantity": 1, "price": 189.5, "customText": "BOULANGERIE SAINT-HONORÉ"}]'::jsonb,
    189.50,
    15.00,
    204.50,
    'whatsapp',
    'Production'
)
on conflict (order_number) do nothing;
