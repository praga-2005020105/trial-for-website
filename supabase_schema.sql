-- ========================================================
-- MY STICKERZ ENSEIGNE — HARDENED PRODUCTION DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor
-- Features: Strict RLS (Anti-IDOR, Anti-Scraping) + Query Indexes
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

-- Drop legacy open policies
drop policy if exists "Allow public insert to orders" on public.orders;
drop policy if exists "Allow public select orders" on public.orders;
drop policy if exists "Allow public update orders" on public.orders;
drop policy if exists "Customers view own orders" on public.orders;
drop policy if exists "Admin order management" on public.orders;

-- Secure RLS Policies for Orders:
-- Policy A: Anyone can place a new order (Checkout)
create policy "Allow public insert to orders"
    on public.orders for insert
    with check (true);

-- Policy B: Customers can only read orders matching their authenticated email OR Admin can read all
create policy "Allow secure select orders"
    on public.orders for select
    using (
        -- Authenticated customer viewing their own orders
        (auth.role() = 'authenticated' and (customer->>'email') = (auth.jwt()->>'email'))
        -- Or authenticated admin manager
        or (auth.jwt()->>'email' = 'admin@mystickerzenseigne.com')
        -- Or service role backend
        or (auth.jwt()->>'role' = 'service_role')
    );

-- Policy C: Only authenticated admin or service role can modify order status
create policy "Allow admin update orders"
    on public.orders for update
    using (
        auth.jwt()->>'email' = 'admin@mystickerzenseigne.com'
        or auth.jwt()->>'role' = 'service_role'
    )
    with check (true);

-- 2. CONTACT MESSAGES TABLE (Data Privacy / Anti-Scraping)
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
drop policy if exists "Allow public select contact_messages" on public.contact_messages;

-- Visitors can submit inquiries
create policy "Allow public insert to contact_messages"
    on public.contact_messages for insert
    with check (true);

-- Only Admin can view customer inquiries (Blocks public scraping)
create policy "Allow admin select contact_messages"
    on public.contact_messages for select
    using (
        auth.jwt()->>'email' = 'admin@mystickerzenseigne.com'
        or auth.jwt()->>'role' = 'service_role'
    );

-- 3. NEWSLETTER SUBSCRIBERS TABLE (GDPR / Privacy Protected)
create table if not exists public.newsletter_subscribers (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    subscribed_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Allow public insert to newsletter_subscribers" on public.newsletter_subscribers;
drop policy if exists "Allow public select newsletter_subscribers" on public.newsletter_subscribers;

-- Public can subscribe
create policy "Allow public insert to newsletter_subscribers"
    on public.newsletter_subscribers for insert
    with check (true);

-- Only Admin can view subscriber list (Prevents email harvesting)
create policy "Allow admin select newsletter_subscribers"
    on public.newsletter_subscribers for select
    using (
        auth.jwt()->>'email' = 'admin@mystickerzenseigne.com'
        or auth.jwt()->>'role' = 'service_role'
    );

-- 4. HIGH-PERFORMANCE DATABASE INDEXES (Eliminate Sequential Scans)
create index if not exists idx_orders_created_at 
    on public.orders (created_at desc);

create index if not exists idx_orders_customer_email 
    on public.orders (((customer->>'email')));

create index if not exists idx_orders_status 
    on public.orders (status);

create index if not exists idx_contact_created_at 
    on public.contact_messages (created_at desc);

-- 5. INITIAL SEED (Idempotent)
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
