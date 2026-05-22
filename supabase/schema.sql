-- Tailor Master Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers table
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Measurements table
create table if not exists public.measurements (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  label text not null default 'Default',
  chest numeric,
  waist numeric,
  hips numeric,
  shoulder numeric,
  sleeve_length numeric,
  inseam numeric,
  outseam numeric,
  neck numeric,
  back_length numeric,
  front_length numeric,
  notes text,
  created_at timestamptz default now() not null
);

-- Orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  measurement_id uuid references public.measurements(id) on delete set null,
  garment_type text not null,
  description text,
  fabric text,
  price numeric not null default 0,
  advance_paid numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'cutting', 'stitching', 'finishing', 'ready', 'delivered', 'cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security
alter table public.customers enable row level security;
alter table public.measurements enable row level security;
alter table public.orders enable row level security;

-- Customers policies
create policy "Users can view their own customers"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "Users can create their own customers"
  on public.customers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own customers"
  on public.customers for update
  using (auth.uid() = user_id);

create policy "Users can delete their own customers"
  on public.customers for delete
  using (auth.uid() = user_id);

-- Measurements policies
create policy "Users can view measurements of their customers"
  on public.measurements for select
  using (
    exists (
      select 1 from public.customers
      where customers.id = measurements.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can create measurements for their customers"
  on public.measurements for insert
  with check (
    exists (
      select 1 from public.customers
      where customers.id = measurements.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can update measurements of their customers"
  on public.measurements for update
  using (
    exists (
      select 1 from public.customers
      where customers.id = measurements.customer_id
      and customers.user_id = auth.uid()
    )
  );

create policy "Users can delete measurements of their customers"
  on public.measurements for delete
  using (
    exists (
      select 1 from public.customers
      where customers.id = measurements.customer_id
      and customers.user_id = auth.uid()
    )
  );

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own orders"
  on public.orders for delete
  using (auth.uid() = user_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Indexes for performance
create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_measurements_customer_id on public.measurements(customer_id);
