-- seed.sql
-- Usage: psql -d postgresql://coffee_shop_jukebox_db_y6ax_user:d82jHKeKjLsde55PklQXsW92xDPYVUbF@dpg-d41qtbggjchc73b6sp9g-a.oregon-postgres.render.com/coffee_shop_jukebox_db_y6ax -f db_seed.sql
-- This file inserts fake data for the Coffee Shop Jukebox schema.

-- Clean up existing rows but keep schema
TRUNCATE TABLE Votes, Queue, History, Genres, Tracks, Users, Rules RESTART IDENTITY CASCADE;

-- ========== Users ==========
INSERT INTO Users (email, is_admin, spotify_user_id, last_request_time, last_login, created_at)
VALUES
  ('admin@coffeeshop.local', TRUE, 'spotify_admin_001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 days'),
  ('alice@example.com', FALSE, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '10 days'),
  ('bob@example.com', FALSE, NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '8 days'),
  ('carol@example.com', FALSE, NULL, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 days'),
  ('dave@example.com', FALSE, NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '14 days'),
  ('eve@example.com', FALSE, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '40 days');

-- ========== Genres ==========
INSERT INTO Genres (name) VALUES
  ('indie'), ('rock'), ('pop'), ('electronic'), ('jazz'), ('ambient'), ('hip-hop'), ('classical'), ('soul'), ('folk');

-- ========== Tracks ==========
-- We'll insert 20 sample tracks. spotify_track_id must be unique.
INSERT INTO Tracks (spotify_track_id, title, artists, release_name, release_id, cover_art_url, genres, is_explicit, duration_ms, last_fetched)
VALUES
  ('track_001', 'Morning Pour', '[{"name":"The Baristas"}]'::jsonb, 'Brewed Moods', 'rel_001', 'https://pics.example/cover1.jpg', '["indie","folk"]'::jsonb, FALSE, 210000, NOW() - INTERVAL '3 days'),
  ('track_002', 'Espresso Logic', '[{"name":"Caffeine Code"}]'::jsonb, 'Coffee Shop Beats', 'rel_002', 'https://pics.example/cover2.jpg', '["electronic","ambient"]'::jsonb, FALSE, 180000, NOW() - INTERVAL '5 days'),
  ('track_003', 'Sugar & Foam', '[{"name":"Latte Lovers"}]'::jsonb, 'Foam', 'rel_003', 'https://pics.example/cover3.jpg', '["pop","soul"]'::jsonb, FALSE, 200000, NOW() - INTERVAL '2 days'),
  ('track_004', 'Quiet Corner', '[{"name":"Acoustic Few"}]'::jsonb, 'Corners', 'rel_004', 'https://pics.example/cover4.jpg', '["folk","indie"]'::jsonb, FALSE, 240000, NOW() - INTERVAL '10 days'),
  ('track_005', 'Late Shift', '[{"name":"Night Baristas"}]'::jsonb, 'After Hours', 'rel_005', 'https://pics.example/cover5.jpg', '["jazz","ambient"]'::jsonb, FALSE, 300000, NOW() - INTERVAL '1 day'),
  ('track_006', 'Steam Whistle', '[{"name":"Machine Shop"}]'::jsonb, 'Mechanics', 'rel_006', 'https://pics.example/cover6.jpg', '["rock"]'::jsonb, TRUE, 195000, NOW() - INTERVAL '8 days'),
  ('track_007', 'Pour Over Dreams', '[{"name":"Dawn Collective"}]'::jsonb, 'Dawn', 'rel_007', 'https://pics.example/cover7.jpg', '["ambient","electronic"]'::jsonb, FALSE, 260000, NOW() - INTERVAL '15 days'),
  ('track_008', 'Stir & Smile', '[{"name":"Happy Spoon"}]'::jsonb, 'Stirred', 'rel_008', 'https://pics.example/cover8.jpg', '["pop"]'::jsonb, FALSE, 170000, NOW() - INTERVAL '20 days'),
  ('track_009', 'Quiet Jazz Set', '[{"name":"Small Combo"}]'::jsonb, 'Quiet Jazz', 'rel_009', 'https://pics.example/cover9.jpg', '["jazz"]'::jsonb, FALSE, 420000, NOW() - INTERVAL '12 days'),
  ('track_010', 'Beans & Boards', '[{"name":"Vinyl Kids"}]'::jsonb, 'Crates', 'rel_010', 'https://pics.example/cover10.jpg', '["indie","rock"]'::jsonb, FALSE, 230000, NOW() - INTERVAL '6 days'),
  ('track_011', 'Minimal Sips', '[{"name":"Loop Lab"}]'::jsonb, 'Minimal', 'rel_011', 'https://pics.example/cover11.jpg', '["electronic","ambient"]'::jsonb, FALSE, 150000, NOW() - INTERVAL '3 days'),
  ('track_012', 'Afternoon Waltz', '[{"name":"Trio Lumina"}]'::jsonb, 'Waltzes', 'rel_012', 'https://pics.example/cover12.jpg', '["classical","jazz"]'::jsonb, FALSE, 360000, NOW() - INTERVAL '7 days'),
  ('track_013', 'Sugar Rush', '[{"name":"Teenage Echoes"}]'::jsonb, 'Rush', 'rel_013', 'https://pics.example/cover13.jpg', '["pop"]'::jsonb, TRUE, 140000, NOW() - INTERVAL '2 days'),
  ('track_014', 'Mellow Milk', '[{"name":"Creamline"}]'::jsonb, 'Mellow', 'rel_014', 'https://pics.example/cover14.jpg', '["soul"]'::jsonb, FALSE, 250000, NOW() - INTERVAL '4 days'),
  ('track_015', 'Old Café Blues', '[{"name":"Blue Note Shop"}]'::jsonb, 'Blues', 'rel_015', 'https://pics.example/cover15.jpg', '["jazz","soul"]'::jsonb, FALSE, 280000, NOW() - INTERVAL '18 days'),
  ('track_016', 'Two Sugars', '[{"name":"Sugar Co."}]'::jsonb, 'Two Sugars', 'rel_016', 'https://pics.example/cover16.jpg', '["pop","indie"]'::jsonb, FALSE, 205000, NOW() - INTERVAL '11 days'),
  ('track_017', 'Back Alley Vinyl', '[{"name":"Spin Crew"}]'::jsonb, 'Vinyl Finds', 'rel_017', 'https://pics.example/cover17.jpg', '["indie","rock"]'::jsonb, FALSE, 245000, NOW() - INTERVAL '14 days'),
  ('track_018', 'Synth Espresso', '[{"name":"Analog Hearts"}]'::jsonb, 'Sips', 'rel_018', 'https://pics.example/cover18.jpg', '["electronic"]'::jsonb, FALSE, 220000, NOW() - INTERVAL '9 days'),
  ('track_019', 'Quiet Conversations', '[{"name":"Table For Two"}]'::jsonb, 'Talks', 'rel_019', 'https://pics.example/cover19.jpg', '["folk","soul"]'::jsonb, FALSE, 190000, NOW() - INTERVAL '13 days'),
  ('track_020', 'Closing Time (Acoustic)', '[{"name":"The Closers"}]'::jsonb, 'Close', 'rel_020', 'https://pics.example/cover20.jpg', '["folk","acoustic"]'::jsonb, FALSE, 255000, NOW() - INTERVAL '21 days');

-- ========== Queue ==========
-- We'll create a short queue with a now-playing item and some queued requests.
-- positions must reflect the order; position values here are explicit.
INSERT INTO Queue (spotify_track_id, requested_by, is_now_playing, is_request, position, upvotes, downvotes, will_be_skipped, added_at)
VALUES
  ('track_005', 1, TRUE, FALSE, 1, 8, 1, FALSE, NOW() - INTERVAL '5 minutes'),     -- admin started playing Late Shift
  ('track_002', 2, FALSE, TRUE, 2, 5, 0, FALSE, NOW() - INTERVAL '40 minutes'),   -- requested by alice
  ('track_004', 3, FALSE, TRUE, 3, 2, 1, FALSE, NOW() - INTERVAL '2 hours'),      -- requested by bob
  ('track_011', 4, FALSE, TRUE, 4, 1, 3, TRUE, NOW() - INTERVAL '30 minutes'),    -- getting downvoted; flagged to skip
  ('track_001', 5, FALSE, TRUE, 5, 3, 0, FALSE, NOW() - INTERVAL '1 day'),        -- requested by dave
  ('track_014', 6, FALSE, TRUE, 6, 0, 0, FALSE, NOW() - INTERVAL '3 days');       -- requested by eve

-- ========== Votes ==========
-- Create votes from different users for queue items
-- Ensure uniqueness (user_id, queue_item_id)
INSERT INTO Votes (user_id, queue_item_id, is_upvote, timestamp)
VALUES
  (2, 1, TRUE, NOW() - INTERVAL '4 minutes'),  -- alice upvoted now playing
  (3, 1, TRUE, NOW() - INTERVAL '3 minutes'),
  (4, 1, TRUE, NOW() - INTERVAL '2 minutes'),
  (5, 1, TRUE, NOW() - INTERVAL '1 minute'),
  (2, 2, TRUE, NOW() - INTERVAL '39 minutes'),
  (3, 2, TRUE, NOW() - INTERVAL '38 minutes'),
  (4, 2, FALSE, NOW() - INTERVAL '37 minutes'),
  (6, 4, FALSE, NOW() - INTERVAL '25 minutes'), -- eve downvote on queue item 4
  (3, 4, FALSE, NOW() - INTERVAL '24 minutes'), -- bob downvote
  (5, 3, TRUE, NOW() - INTERVAL '1 hour');

-- ========== History ==========
-- Some tracks already played in the past
INSERT INTO History (spotify_track_id, requested_by, played_at)
VALUES
  ('track_010', 2, NOW() - INTERVAL '2 days'),
  ('track_009', 3, NOW() - INTERVAL '3 days'),
  ('track_003', 5, NOW() - INTERVAL '1 week'),
  ('track_007', 4, NOW() - INTERVAL '10 days');

-- ========== Rules ==========
-- Insert a few admin rules (jsonb in value). "type" is a textual classification; feel free to change.
INSERT INTO Rules (name, value, type, description, last_updated)
VALUES
  ('voteThreshold', '{"threshold": 0.6}'::jsonb, 'voting', 'If downvote_ratio >= threshold, mark for skip', NOW() - INTERVAL '1 day'),
  ('minimumVotes', '{"minimum": 3}'::jsonb, 'voting', 'Minimum number of votes required before voteThreshold is evaluated', NOW() - INTERVAL '1 day'),
  ('maxLengthMs', '{"max_duration_ms": 420000}'::jsonb, 'length', 'Tracks longer than this cannot be requested', NOW() - INTERVAL '2 days'),
  ('genreBlacklist', '{"blacklist": ["metal", "hardcore", "gabber"]}'::jsonb, 'genre', 'Disallowed genres for requests', NOW() - INTERVAL '3 days'),
  ('genreWhitelist', '{"whitelist": ["indie","folk","jazz","ambient","electronic","pop","soul","classical"]}'::jsonb, 'genre', 'Preferred genres', NOW() - INTERVAL '3 days'),
  ('maxRequestsPerHour', '{"per_user_hour": 2}'::jsonb, 'rate_limit', 'Limit requests per user per hour', NOW() - INTERVAL '4 days');

-- Sanity check: show counts (optional; uncomment if running interactively)
SELECT 'users' AS t, count(*) FROM Users;
SELECT 'tracks' AS t, count(*) FROM Tracks;
SELECT 'queue' AS t, count(*) FROM Queue;
SELECT 'votes' AS t, count(*) FROM Votes;
SELECT 'history' AS t, count(*) FROM History;
SELECT 'rules' AS t, count(*) FROM Rules;

-- Done.