import { pool } from '../config/dbConn.js';

/**
 * Fetches timestamp of user's last request
 * 
 * @param {number} userId - The ID of the user for whom the time of the most recent request is being fetched.
 * @return {Promise<Object|null>} - Returns the timestamp of the user's most recent request, or null if not found.
 */
const fetchLastRequestTime = async (userId) => {
    const query = `
	    SELECT 
	        last_request_time
	    FROM
	        Users
	    WHERE
	        id = $1
    `;
    const parameters = [userId];
    try {
	    const { rows } = await pool.query(query, parameters);
	    return rows[0] || null;
    } catch(err) {
	    console.error("Error in UserModel.fetchLastRequestTime:", err);
	    throw err;
    }
}

export {
    fetchLastRequestTime,
};
