DROP TABLE IF EXISTS Votes CASCADE;
DROP TABLE IF EXISTS Queue CASCADE;
DROP TABLE IF EXISTS History CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Tracks CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Rules CASCADE;
DROP TABLE IF EXISTS Default_Playlists CASCADE;


CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    spotify_user_id VARCHAR(255) UNIQUE,
    last_request_time TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Tracks (
    spotify_track_id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    artists JSONB NOT NULL,
    release_name TEXT NOT NULL,
    release_id VARCHAR(255) NOT NULL,
    cover_art_url TEXT NOT NULL,
    genres JSONB NOT NULL,
    is_explicit BOOLEAN NOT NULL DEFAULT FALSE,
    duration_ms INT NOT NULL,
    last_fetched TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Queue (
    id SERIAL PRIMARY KEY,
    spotify_track_id VARCHAR(255) NOT NULL REFERENCES Tracks(spotify_track_id),
    requested_by INT REFERENCES Users(id) ON DELETE CASCADE,
    is_now_playing BOOLEAN NOT NULL DEFAULT FALSE,
    is_request BOOLEAN NOT NULL DEFAULT TRUE,
    position INT NOT NULL,
    upvotes INT NOT NULL DEFAULT 0,
    downvotes INT NOT NULL DEFAULT 0,
    will_be_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Votes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    queue_item_id INT NOT NULL REFERENCES Queue(id) ON DELETE CASCADE,
    is_upvote BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, queue_item_id)
);

CREATE TABLE Genres (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE History (
    id SERIAL PRIMARY KEY,
    spotify_track_id VARCHAR(255) NOT NULL REFERENCES Tracks(spotify_track_id) ON DELETE CASCADE,
    requested_by INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    played_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Rules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Default_Playlists (
    id SERIAL PRIMARY KEY,
    spotify_uri TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    track_index_bookmark INT NOT NULL DEFAULT 0
);