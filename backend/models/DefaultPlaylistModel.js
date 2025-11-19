// backend/models/DefaultPlaylistModel.js
import pool from "../config/dbConn.js";

export const insertDefaultPlaylist = async (spotifyUri) => {
  const query = `
    INSERT INTO default_playlists (spotify_uri)
    VALUES ($1)
    RETURNING *;
  `;
  const result = await pool.query(query, [spotifyUri]);
  return result.rows[0];
};

export const getLatestDefaultPlaylist = async () => {
  const query = `
    SELECT *
    FROM default_playlists
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await pool.query(query);
  return result.rows[0] || null;
};

export const incrementPlaylistBookmark = async () => {
  const query = `
    UPDATE default_playlists
    SET track_index_bookmark = track_index_bookmark + 1
    WHERE id = (
      SELECT id FROM default_playlists
      ORDER BY created_at DESC
      LIMIT 1
    )
    RETURNING *;
  `;

  const result = await pool.query(query);
  return result.rows[0] || null;  // returns updated playlist or null if none exist
};
