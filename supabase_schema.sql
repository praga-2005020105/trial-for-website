-- ========================================================
-- MY STICKERZ ENSEIGNE — HARDENED PRODUCTION DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor
-- Features: Strict RLS (Anti-IDOR, Anti-Scraping, Self-Data Access Only) + Query Indexes
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

-- Turn on Row Level Security (RLS)
alter table public.orders enable row level security;

-- Drop legacy, insecure, or conflicting policies
drop policy if exists "Allow public insert to orders" on public.orders;
drop policy if exists "Allow public select orders" on public.orders;
drop policy if exists "Allow public update orders" on public.orders;
drop policy if exists "Allow secure select orders" on public.orders;
drop policy if exists "Allow admin update orders" on public.orders;
drop policy if exists "Customers view own orders" on public.orders;
drop policy if exists "Admin order management" on public.orders;
drop policy if exists "Only admin update orders" on public.orders;
drop policy if exists "Only admin delete orders" on public.orders;

-- Policy A: Anyone (guest or registered customer) can place a new order during checkout
create policy "Allow public insert to orders"
    on public.orders for insert
    with check (true);

-- Policy B: STRICT RLS — Customers can ONLY view their own orders; Workshop Admins view all
create policy "Customers view own orders"
    on public.orders for select
    using (
        -- Authenticated user can ONLY see orders where customer email matches their account email
        lower(customer->>'email') = lower(auth.jwt()->>'email')
        -- OR authorized workshop admin accounts
        or auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        -- OR backend service role (never exposed to client)
        or auth.jwt()->>'role' = 'service_role'
    );

-- Policy C: Only authorized Workshop Admin or Service Role can update order status
create policy "Only admin update orders"
    on public.orders for update
    using (
        auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    )
    with check (
        auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    );

-- Policy D: Only authorized Workshop Admin or Service Role can delete orders
create policy "Only admin delete orders"
    on public.orders for delete
    using (
        auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    );

-- 2. CONTACT MESSAGES TABLE (Data Privacy / Anti-Scraping / RLS Protected)
create table if not exists public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text,
    subject text,
    message text not null,
    created_at timestamptz default now()
);

-- Turn on Row Level Security (RLS)
alter table public.contact_messages enable row level security;

-- Drop legacy policies
drop policy if exists "Allow public insert to contact_messages" on public.contact_messages;
drop policy if exists "Allow public select contact_messages" on public.contact_messages;
drop policy if exists "Allow admin select contact_messages" on public.contact_messages;
drop policy if exists "Users view own inquiries or admin" on public.contact_messages;
drop policy if exists "Only admin manage contact_messages" on public.contact_messages;

-- Policy A: Anyone can submit a contact inquiry from the website
create policy "Allow public insert to contact_messages"
    on public.contact_messages for insert
    with check (true);

-- Policy B: STRICT RLS — Users can ONLY view inquiries they submitted; Admin views all
create policy "Users view own inquiries or admin"
    on public.contact_messages for select
    using (
        lower(email) = lower(auth.jwt()->>'email')
        or auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    );

-- Policy C: Only Workshop Admin can update or delete inquiries
create policy "Only admin manage contact_messages"
    on public.contact_messages for all
    using (
        auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    );

-- 3. NEWSLETTER SUBSCRIBERS TABLE (GDPR Privacy Protected)
create table if not exists public.newsletter_subscribers (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    subscribed_at timestamptz default now()
);

-- Turn on Row Level Security (RLS)
alter table public.newsletter_subscribers enable row level security;

-- Drop legacy policies
drop policy if exists "Allow public insert to newsletter_subscribers" on public.newsletter_subscribers;
drop policy if exists "Allow public select newsletter_subscribers" on public.newsletter_subscribers;
drop policy if exists "Allow admin select newsletter_subscribers" on public.newsletter_subscribers;
drop policy if exists "Users view own subscription or admin" on public.newsletter_subscribers;
drop policy if exists "User unsubscribe or admin manage" on public.newsletter_subscribers;

-- Policy A: Anyone can subscribe to the newsletter
create policy "Allow public insert to newsletter_subscribers"
    on public.newsletter_subscribers for insert
    with check (true);

-- Policy B: STRICT RLS — Users can only see their own subscription; Admin views all
create policy "Users view own subscription or admin"
    on public.newsletter_subscribers for select
    using (
        lower(email) = lower(auth.jwt()->>'email')
        or auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
        or auth.jwt()->>'role' = 'service_role'
    );

-- Policy C: User can unsubscribe (delete own record) or Admin can manage
create policy "User unsubscribe or admin manage"
    on public.newsletter_subscribers for delete
    using (
        lower(email) = lower(auth.jwt()->>'email')
        or auth.jwt()->>'email' in ('mystickerz75@gmail.com', 'admin@mystickerzenseigne.com')
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

create index if not exists idx_newsletter_email 
    on public.newsletter_subscribers (email);

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
