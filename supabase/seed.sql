-- DefiMarT Seed Data
-- Run this after schema.sql to populate with test data

-- Seed Users
INSERT INTO public.users (id, wallet_address, username, display_name, bio, verified, events_attended, items_owned, items_sold, total_sales, reputation, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'solana_dev', 'Solana Developer', 'Building on Solana since Day 1. Collector of rare event merch.', true, ARRAY['breakpoint-2024', 'solana-hacker-house-sf'], 24, 12, 15.5, 98, '2024-01-15'),
  ('22222222-2222-2222-2222-222222222222', 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq', 'nft_collector', 'NFT Enthusiast', 'Passionate about Solana NFTs and event collectibles', true, ARRAY['breakpoint-2024', 'solana-summit-2024'], 42, 8, 8.2, 95, '2024-02-20');

-- Seed Events
INSERT INTO public.events (id, slug, name, description, cover_image_url, location, date, end_date, organizer, verified, total_items, total_collectors, tags, website, on_chain_contract_address, on_chain_verified) VALUES
  ('aaaa1111-aaaa-1111-aaaa-111111111111', 'breakpoint-2024', 'Breakpoint 2024', 'The biggest Solana conference of the year', '/api/placeholder/1200/400', 'Singapore', '2024-09-20', '2024-09-23', 'Solana Foundation', true, 156, 2834, ARRAY['conference', 'official', 'solana'], 'https://breakpoint.solana.com', 'BreakpointVerified2024...', true),
  ('aaaa2222-aaaa-2222-aaaa-222222222222', 'solana-hacker-house-sf', 'Solana Hacker House SF', 'Build, learn, and connect in San Francisco', '/api/placeholder/1200/400', 'San Francisco, CA', '2024-10-05', '2024-10-07', 'Solana Foundation', true, 48, 234, ARRAY['hacker-house', 'builders', 'community'], NULL, NULL, false),
  ('aaaa3333-aaaa-3333-aaaa-333333333333', 'solana-summit-2024', 'Solana Summit 2024', 'Community-driven summit across multiple cities', '/api/placeholder/1200/400', 'Multiple Locations', '2024-08-15', NULL, 'Community Led', false, 89, 567, ARRAY['community', 'summit', 'global'], NULL, NULL, false);

-- Seed Listings
INSERT INTO public.listings (id, seller_id, event_id, title, description, images, category, condition, price, currency, status, quantity, quantity_available, is_nft, shipping_info, views, favorites, tags, created_at) VALUES
  ('bbbb1111-bbbb-1111-bbbb-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'Breakpoint 2024 Limited Edition T-Shirt', 'Official Breakpoint 2024 conference t-shirt. Size L. Never worn, still in original packaging. Features exclusive event branding.', ARRAY['/api/placeholder/600/600', '/api/placeholder/600/600'], 'apparel', 'new', 0.5, 'SOL', 'active', 1, 1, false, '{"ships_from": "Singapore", "ships_to": ["Worldwide"], "estimated_days": "7-14 business days", "cost": 0.05}'::jsonb, 234, 18, ARRAY['breakpoint', 'official', 't-shirt', 'limited-edition'], '2024-09-25'),
  ('bbbb2222-bbbb-2222-bbbb-222222222222', '22222222-2222-2222-2222-222222222222', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'Breakpoint 2024 Attendee NFT Badge', 'Verified proof of attendance NFT from Breakpoint 2024. Includes on-chain verification and special holder benefits.', ARRAY['/api/placeholder/600/600'], 'nft', 'new', 1.2, 'SOL', 'active', 1, 1, true, NULL, 567, 42, ARRAY['breakpoint', 'nft', 'proof-of-attendance', 'verified'], '2024-09-24'),
  ('bbbb3333-bbbb-3333-bbbb-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaa2222-aaaa-2222-aaaa-222222222222', 'Solana Hacker House Hoodie', 'Exclusive hoodie from SF Hacker House. Size M. Worn once, excellent condition.', ARRAY['/api/placeholder/600/600', '/api/placeholder/600/600'], 'apparel', 'like-new', 0.8, 'SOL', 'active', 1, 1, false, '{"ships_from": "San Francisco, CA", "ships_to": ["USA", "Canada"], "estimated_days": "3-7 business days", "cost": 0.03}'::jsonb, 145, 12, ARRAY['hacker-house', 'hoodie', 'exclusive'], '2024-10-08'),
  ('bbbb4444-bbbb-4444-bbbb-444444444444', '22222222-2222-2222-2222-222222222222', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'Breakpoint VIP Lanyard & Badge Set', 'Complete VIP access badge and lanyard from Breakpoint 2024. Includes all original materials.', ARRAY['/api/placeholder/600/600'], 'collectible', 'like-new', 0.3, 'SOL', 'active', 1, 1, false, '{"ships_from": "Singapore", "ships_to": ["Worldwide"], "estimated_days": "7-14 business days", "cost": 0.02}'::jsonb, 89, 7, ARRAY['breakpoint', 'vip', 'badge', 'collectible'], '2024-09-26');

-- Update listing-2 with NFT metadata
UPDATE public.listings SET nft_metadata = '{"mint_address": "BreakpointNFT2024abc123...", "metaplex_uri": "https://arweave.net/...", "collection": "Breakpoint 2024 Official"}'::jsonb WHERE id = 'bbbb2222-bbbb-2222-bbbb-222222222222';

-- Seed Posts
INSERT INTO public.posts (id, user_id, content, images, linked_listing_id, event_id, likes_count, comments_count, shares_count, tags, created_at) VALUES
  ('cccc1111-cccc-1111-cccc-111111111111', '11111111-1111-1111-1111-111111111111', 'Just got my hands on this rare Breakpoint 2024 merch! The quality is incredible', ARRAY['/api/placeholder/600/600'], 'bbbb1111-bbbb-1111-bbbb-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', 234, 18, 12, ARRAY['breakpoint', 'merch', 'collection'], '2024-09-25T14:30:00'),
  ('cccc2222-cccc-2222-cccc-222222222222', '22222222-2222-2222-2222-222222222222', 'Finally completed my Breakpoint collection! Check out this NFT badge', ARRAY['/api/placeholder/600/600'], 'bbbb2222-bbbb-2222-bbbb-222222222222', 'aaaa1111-aaaa-1111-aaaa-111111111111', 156, 24, 8, ARRAY['nft', 'collection', 'breakpoint'], '2024-09-24T10:15:00');
