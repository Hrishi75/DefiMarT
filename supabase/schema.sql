-- DefiMarT Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- ============================================================
-- USERS TABLE
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  cover_image_url text,
  verified boolean default false,
  events_attended text[] default '{}',
  social_links jsonb default '{}',
  items_owned integer default 0,
  items_sold integer default 0,
  total_sales numeric(20,9) default 0,
  reputation numeric(5,2) default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EVENTS TABLE
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  cover_image_url text,
  logo_url text,
  location text not null,
  date timestamptz not null,
  end_date timestamptz,
  organizer text not null,
  organizer_id uuid references public.users(id),
  verified boolean default false,
  total_items integer default 0,
  total_collectors integer default 0,
  tags text[] default '{}',
  website text,
  on_chain_contract_address text,
  on_chain_verified boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id),
  event_id uuid references public.events(id),
  title text not null,
  description text,
  images text[] default '{}',
  category text not null check (category in ('apparel','collectible','nft','accessory','badge','other')),
  condition text not null check (condition in ('new','like-new','good','fair')),
  price numeric(20,9) not null,
  currency text default 'SOL' check (currency in ('SOL','USDC')),
  status text default 'active' check (status in ('active','sold','pending','cancelled','escrowed')),
  quantity integer default 1,
  quantity_available integer default 1,
  is_nft boolean default false,
  nft_metadata jsonb,
  shipping_info jsonb,
  views integer default 0,
  favorites integer default 0,
  tags text[] default '{}',
  escrow_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  buyer_id uuid not null references public.users(id),
  seller_id uuid not null references public.users(id),
  amount numeric(20,9) not null,
  currency text default 'SOL',
  status text default 'pending' check (status in ('pending','escrowed','confirmed','shipped','completed','failed','refunded','disputed')),
  transaction_hash text,
  escrow_address text,
  shipping_tracking text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- POSTS TABLE
-- ============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  content text not null,
  images text[] default '{}',
  linked_listing_id uuid references public.listings(id),
  event_id uuid references public.events(id),
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id),
  content text not null,
  parent_comment_id uuid references public.comments(id),
  created_at timestamptz default now()
);

-- ============================================================
-- LIKES TABLE
-- ============================================================
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  post_id uuid references public.posts(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id),
  unique(user_id, listing_id),
  check (post_id is not null or listing_id is not null)
);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id),
  following_id uuid not null references public.users(id),
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  type text not null check (type in ('sale','purchase','message','follow','like','comment')),
  title text not null,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- AUTH NONCES TABLE (wallet sign-in challenges)
-- ============================================================
create table public.auth_nonces (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  nonce text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_users_wallet on public.users(wallet_address);
create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_event on public.listings(event_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_category on public.listings(category);
create index idx_transactions_buyer on public.transactions(buyer_id);
create index idx_transactions_seller on public.transactions(seller_id);
create index idx_posts_user on public.posts(user_id);
create index idx_comments_post on public.comments(post_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id) where read = false;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.transactions enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.events enable row level security;
alter table public.auth_nonces enable row level security;

-- Users: anyone can read, only owner can update
create policy "Users are publicly readable" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (true);

-- Events: anyone can read
create policy "Events are publicly readable" on public.events for select using (true);
create policy "Organizers can create events" on public.events for insert with check (auth.uid() = organizer_id);

-- Listings: anyone reads, seller manages own
create policy "Listings are publicly readable" on public.listings for select using (true);
create policy "Sellers can create listings" on public.listings for insert with check (auth.uid() = seller_id);
create policy "Sellers can update own listings" on public.listings for update using (auth.uid() = seller_id);

-- Transactions: parties can read their own
create policy "Users can view own transactions" on public.transactions for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers can create transactions" on public.transactions for insert
  with check (auth.uid() = buyer_id);
create policy "Transaction parties can update" on public.transactions for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Posts: anyone reads, author manages own
create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Users can create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Comments: anyone reads, author manages own
create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Likes: anyone reads, user manages own
create policy "Likes are publicly readable" on public.likes for select using (true);
create policy "Users can create likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on public.likes for delete using (auth.uid() = user_id);

-- Follows: anyone reads, user manages own
create policy "Follows are publicly readable" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Notifications: user reads own
create policy "Users can view own notifications" on public.notifications for select
  using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update
  using (auth.uid() = user_id);

-- Auth nonces: service role only (accessed via admin client in API routes)
create policy "Service role manages nonces" on public.auth_nonces for all using (true);

-- ============================================================
-- TRIGGERS: Auto-update counts
-- ============================================================

-- Update post likes count on like insert/delete
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.post_id is not null then
    update posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' and OLD.post_id is not null then
    update posts set likes_count = likes_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_like_change
after insert or delete on public.likes
for each row
execute function update_post_likes_count();

-- Update post comments count on comment insert/delete
create or replace function update_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comments_count = comments_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_comment_change
after insert or delete on public.comments
for each row
execute function update_post_comments_count();

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
for each row execute function update_updated_at();

create trigger listings_updated_at before update on public.listings
for each row execute function update_updated_at();
