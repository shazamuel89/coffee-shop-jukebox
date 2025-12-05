import { pool } from "../config/dbConn.js";

/**
 * Fetches limited and sorted list of top tracks
 *
 * @param {number} limit - Number of tracks to include.
 * @return {Promise<Array>}
 */
const fetchTopTracks = async (limit) => {
    const query = `
	SELECT 
	    *
	FROM 
	    History
	ORDER BY
	    requested_by DESC
	LIMIT $1
    `;
    const parameters = [limit];
    try {
	const { rows } = await pool.query(query, parameters);
	return rows;
    } catch(err) {
	console.error("Error in HistoryModel.fetchTopTracks:", err);
	throw err;
    }
}
