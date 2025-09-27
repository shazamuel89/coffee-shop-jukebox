CREATE TABLE Queue (
    id SERIAL PRIMARY KEY,
    spotify_track_id VARCHAR(255) NOT NULL,
    requested_by INT REFERENCES Users(id),
    is_now_playing BOOLEAN NOT NULL DEFAULT FALSE,
    is_request BOOLEAN NOT NULL DEFAULT TRUE,
    position INT NOT NULL,
    upvotes INT NOT NULL DEFAULT 0,
    downvotes INT NOT NULL DEFAULT 0,
    will_be_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Tracks (
    spotify_track_id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    artists JSONB NOT NULL,
    release_name TEXT NOT NULL,
    release_id VARCHAR(255) NOT NULL,
    cover_art_url TEXT NOT NULL,
    duration_ms INT NOT NULL,
    last_fetched TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Requests_Played_History (
    id SERIAL PRIMARY KEY,
    spotify_track_id VARCHAR(255) NOT NULL REFERENCES Tracks(id),
    requested_by INT NOT NULL REFERENCES Users(id),
    requested_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    spotify_user_id VARCHAR(255) UNIQUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE Admin_Rules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);