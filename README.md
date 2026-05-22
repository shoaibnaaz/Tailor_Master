# ✂️ Tailor Master

A full-stack tailoring management system built with **Next.js 16**, **Supabase**, and **Tailwind CSS**.  
Manage customers, track measurements, and handle orders — all in one clean dashboard.

## Features

- **Authentication** — Email/password sign-up and sign-in via Supabase Auth
- **Dashboard** — At-a-glance stats: customers, active orders, revenue, and pending payments
- **Customer Management** — Add, view, and delete customers with contact details
- **Measurements** — Record multiple measurement sets per customer (chest, waist, hips, shoulder, etc.)
- **Order Management** — Create orders, assign garment types, set prices, track status through workflow stages
- **Order Status Workflow** — Pending → Cutting → Stitching → Finishing → Ready → Delivered
- **Responsive UI** — Works on desktop and mobile with a collapsible nav
- **Row-Level Security** — Each user only sees their own data

## Tech Stack

| Layer      | Technology              |
|-----------|------------------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript             |
| Styling   | Tailwind CSS v4        |
| Database  | Supabase (PostgreSQL)  |
| Auth      | Supabase Auth          |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/shoaibnaaz/Tailor_Master.git
cd Tailor_Master
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your project URL and anon key
3. Copy the env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the database schema — go to **SQL Editor** in Supabase dashboard and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), then click **Run**.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account to get started.

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated pages with navbar
│   │   ├── dashboard/      # Dashboard with stats
│   │   ├── customers/      # Customer list, detail, and creation
│   │   └── orders/         # Order list, detail, and creation
│   ├── auth/               # Login, signup, and callback
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/             # Shared UI components
├── lib/                    # Supabase clients and types
└── middleware.ts           # Auth middleware
supabase/
└── schema.sql              # Database schema with RLS policies
```

## Database Schema

- **customers** — name, phone, email, address, notes
- **measurements** — per-customer measurement records (chest, waist, hips, etc.)
- **orders** — garment type, fabric, price, advance, status, due date

All tables have Row-Level Security enabled so users only access their own data.

## License

MIT
