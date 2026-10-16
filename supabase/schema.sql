-- ============================================================
-- CURATED OOTD — Supabase Database Schema
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── 1. PROFILES (user yang register) ───────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  email       text,
  avatar_url  text default '',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: baca semua" on public.profiles
  for select using (true);

create policy "Profiles: insert sendiri" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Profiles: update sendiri" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update
    set email      = excluded.email,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. CATEGORIES ──────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text default '',
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Categories: baca semua" on public.categories
  for select using (true);

create policy "Categories: insert admin only" on public.categories
  for insert with check (true);

create policy "Categories: delete admin only" on public.categories
  for delete using (true);

insert into public.categories (name, slug, description) values
  ('Semua Koleksi',            'all',          'Semua kurasi outfit pilihan'),
  ('Streetwear',               'streetwear',   'Oversized silhouettes, cargo pants, boxy hoodies, dan urban aesthetics'),
  ('Casual Essentials',        'kasual',        'Koleksi harian santai, nyaman, dan versatile untuk berbagai aktivitas'),
  ('Smart Casual',             'smart-casual', 'Kombinasi tailored blazer, knitwear, chino, dan loafers semi-formal'),
  ('Minimalist & Earth Tone',  'minimalis',    'Potongan clean, palet netral (beige, sand, olive), tanpa grafis berlebih'),
  ('Vintage & Retro',          'vintage',      'Nuansa klasik 90-an, leather jacket, washed denim, dan aksen nostalgia'),
  ('Formal & Tailored',        'formal',       'Setelan jas berstruktur, gaun pesta elegan, dan pakaian acara resmi'),
  ('Athleisure & Sporty',      'sporty',       'Kenyamanan busana olahraga yang dipadukan dengan gaya street modern')
on conflict (slug) do nothing;

-- ─── 3. OUTFITS ─────────────────────────────────────────────
create table if not exists public.outfits (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  image_url   text not null,
  tags        text[] default '{}',
  likes_count integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.outfits enable row level security;

create policy "Outfits: baca semua" on public.outfits
  for select using (true);

create policy "Outfits: insert admin" on public.outfits
  for insert with check (true);

create policy "Outfits: update admin" on public.outfits
  for update using (true);

create policy "Outfits: delete admin" on public.outfits
  for delete using (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists outfits_set_updated_at on public.outfits;
create trigger outfits_set_updated_at
  before update on public.outfits
  for each row execute procedure public.set_updated_at();

-- ─── 4. OUTFIT ITEMS (hotspot) ──────────────────────────────
create table if not exists public.outfit_items (
  id            uuid primary key default gen_random_uuid(),
  outfit_id     uuid not null references public.outfits(id) on delete cascade,
  name          text not null,
  brand         text,
  price         integer,
  affiliate_url text not null default '',
  x             integer,
  y             integer,
  created_at    timestamptz default now()
);

alter table public.outfit_items enable row level security;

create policy "OutfitItems: baca semua" on public.outfit_items
  for select using (true);

create policy "OutfitItems: insert admin" on public.outfit_items
  for insert with check (true);

create policy "OutfitItems: update admin" on public.outfit_items
  for update using (true);

create policy "OutfitItems: delete admin" on public.outfit_items
  for delete using (true);

-- ─── 5. STORAGE BUCKET untuk avatars ────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars: upload public" on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "Avatars: baca public" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Avatars: delete sendiri" on storage.objects
  for delete using (bucket_id = 'avatars');

-- ─── 6. ADMIN SETTINGS (kredensial admin yang bisa diedit) ──
create table if not exists public.admin_settings (
  id         int primary key default 1,
  username   text not null default 'adminootd',
  email      text not null default 'adminootd@gmail.com',
  password   text not null default 'admin1027',
  avatar_url text default '',
  updated_at timestamptz default now(),
  constraint admin_single_row check (id = 1)
);

-- Hanya bisa diakses via service role key (server-side saja)
alter table public.admin_settings enable row level security;

-- Seed data awal admin
insert into public.admin_settings (id, username, email, password, avatar_url)
values (1, 'adminootd', 'adminootd@gmail.com', 'admin1027', '')
on conflict (id) do nothing;
