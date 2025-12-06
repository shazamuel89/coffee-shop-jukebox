-- seed.sql
-- This file inserts fake data for the Coffee Shop Jukebox schema.

-- Clean up existing rows but keep schema
TRUNCATE TABLE Votes, Queue, History, Genres, Tracks, Users, Rules, Default_Playlists RESTART IDENTITY CASCADE;

-- ========== Users ==========
INSERT INTO Users (email, is_admin, spotify_user_id, last_request_time, last_login, created_at)
VALUES
  ('example_user@coffeeshop.local', FALSE, NULL, NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '7 days');
--  ('admin@coffeeshop.local', TRUE, 'spotify_admin_001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 days'),
--  ('alice@example.com', FALSE, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '10 days'),
--  ('bob@example.com', FALSE, NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '8 days'),
--  ('carol@example.com', FALSE, NULL, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 days'),
--  ('dave@example.com', FALSE, NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '14 days'),
--  ('eve@example.com', FALSE, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '40 days');

-- ========== Genres ==========
--INSERT INTO Genres (name) VALUES
--  ('indie'), ('rock'), ('pop'), ('electronic'), ('jazz'), ('ambient'), ('hip-hop'), ('classical'), ('soul'), ('folk');

-- ========== Tracks ==========
-- We'll insert 20 sample tracks. spotify_track_id must be unique.
--INSERT INTO Tracks (spotify_track_id, title, artists, release_name, release_id, cover_art_url, genres, is_explicit, duration_ms, last_fetched)
--VALUES
--  ('track_001', 'Morning Pour', '[{"name":"The Baristas"}]'::jsonb, 'Brewed Moods', 'rel_001', 'https://pics.example/cover1.jpg', '["indie","folk"]'::jsonb, FALSE, 210000, NOW() - INTERVAL '3 days'),
--  ('track_002', 'Espresso Logic', '[{"name":"Caffeine Code"}]'::jsonb, 'Coffee Shop Beats', 'rel_002', 'https://pics.example/cover2.jpg', '["electronic","ambient"]'::jsonb, FALSE, 180000, NOW() - INTERVAL '5 days');
--  ('track_003', 'Sugar & Foam', '[{"name":"Latte Lovers"}]'::jsonb, 'Foam', 'rel_003', 'https://pics.example/cover3.jpg', '["pop","soul"]'::jsonb, FALSE, 200000, NOW() - INTERVAL '2 days'),
--  ('track_004', 'Quiet Corner', '[{"name":"Acoustic Few"}]'::jsonb, 'Corners', 'rel_004', 'https://pics.example/cover4.jpg', '["folk","indie"]'::jsonb, FALSE, 240000, NOW() - INTERVAL '10 days'),
--  ('track_005', 'Late Shift', '[{"name":"Night Baristas"}]'::jsonb, 'After Hours', 'rel_005', 'https://pics.example/cover5.jpg', '["jazz","ambient"]'::jsonb, FALSE, 300000, NOW() - INTERVAL '1 day');

-- ========== Queue ==========
-- We'll create a short queue with a now-playing item and some queued requests.
-- positions must reflect the order; position values here are explicit.
--INSERT INTO Queue (spotify_track_id, requested_by, is_now_playing, is_request, position, upvotes, downvotes, will_be_skipped, added_at)
--VALUES
--  ('track_005', 1, TRUE, FALSE, 1, 8, 1, FALSE, NOW() - INTERVAL '5 minutes'),     -- admin started playing Late Shift
--  ('track_002', 2, FALSE, TRUE, 2, 5, 0, FALSE, NOW() - INTERVAL '40 minutes'),   -- requested by alice
--  ('track_004', 3, FALSE, TRUE, 3, 2, 1, FALSE, NOW() - INTERVAL '2 hours'),      -- requested by bob
--  ('track_011', 4, FALSE, TRUE, 4, 1, 3, TRUE, NOW() - INTERVAL '30 minutes'),    -- getting downvoted; flagged to skip
--  ('track_001', 5, FALSE, TRUE, 5, 3, 0, FALSE, NOW() - INTERVAL '1 day'),        -- requested by dave
--  ('track_014', 6, FALSE, TRUE, 6, 0, 0, FALSE, NOW() - INTERVAL '3 days');       -- requested by eve

-- ========== Votes ==========
-- Create votes from different users for queue items
-- Ensure uniqueness (user_id, queue_item_id)
--INSERT INTO Votes (user_id, queue_item_id, is_upvote, timestamp)
--VALUES
--  (2, 1, TRUE, NOW() - INTERVAL '4 minutes'),  -- alice upvoted now playing
--  (3, 1, TRUE, NOW() - INTERVAL '3 minutes'),
--  (4, 1, TRUE, NOW() - INTERVAL '2 minutes'),
--  (5, 1, TRUE, NOW() - INTERVAL '1 minute'),
--  (2, 2, TRUE, NOW() - INTERVAL '39 minutes'),
--  (3, 2, TRUE, NOW() - INTERVAL '38 minutes'),
--  (4, 2, FALSE, NOW() - INTERVAL '37 minutes'),
--  (6, 4, FALSE, NOW() - INTERVAL '25 minutes'), -- eve downvote on queue item 4
--  (3, 4, FALSE, NOW() - INTERVAL '24 minutes'), -- bob downvote
--  (5, 3, TRUE, NOW() - INTERVAL '1 hour');

-- ========== History ==========
-- Some tracks already played in the past
--INSERT INTO History (spotify_track_id, requested_by, played_at)
--VALUES
--  ('track_010', 2, NOW() - INTERVAL '2 days'),
--  ('track_009', 3, NOW() - INTERVAL '3 days'),
--  ('track_003', 5, NOW() - INTERVAL '1 week'),
--  ('track_007', 4, NOW() - INTERVAL '10 days');

-- ========== Rules ==========
-- Insert a few admin rules (jsonb in value). "type" is a textual classification; feel free to change.
INSERT INTO Rules (name, value, type, description, last_updated)
VALUES
    (
        'voteThreshold',
        '{"threshold": 0.6}'::jsonb,
        'voting',
        'If downvote_ratio >= threshold, mark for skip',
        NOW() - INTERVAL '1 day'
    ),
    (
        'minimumVotes',
        '{"minimum": 3}'::jsonb,
        'voting',
        'Minimum number of votes required before voteThreshold is evaluated',
        NOW() - INTERVAL '1 day'
    ),
    (
        'maxLengthMs',
        '{"max_duration_ms": 420000}'::jsonb,
        'length',
        'Tracks cannot be requested if they are longer than: ',
        NOW() - INTERVAL '2 days'
    ),
    (
        'genreBlacklist',
        '{"blacklist": ["metal", "hardcore", "gabber"]}'::jsonb,
        'genre',
        'Disallowed genres',
        NOW() - INTERVAL '3 days'
    ),
    (
        'genreWhitelist',
        '{"whitelist": ["indie","folk","jazz","ambient","electronic","pop","soul","classical"]}'::jsonb,
        'genre',
        'Preferred genres',
        NOW() - INTERVAL '3 days'
    ),
    (
        'requestCooldown',
        '{"request_cooldown_minutes": 1}'::jsonb,
        'rate_limit',
        'Time to wait until next request: ',
        NOW() - INTERVAL '4 days'
    ),
    (
        'explicitDisallowed',
        '{"disallowed": true}'::jsonb,
        'content',
        'Explicit tracks are not allowed',
        NOW()
    );

-- Sanity check: show counts (optional; uncomment if running interactively)
SELECT 'users' AS t, count(*) FROM Users;
SELECT 'tracks' AS t, count(*) FROM Tracks;
SELECT 'queue' AS t, count(*) FROM Queue;
SELECT 'votes' AS t, count(*) FROM Votes;
SELECT 'history' AS t, count(*) FROM History;
SELECT 'rules' AS t, count(*) FROM Rules;

-- Done.