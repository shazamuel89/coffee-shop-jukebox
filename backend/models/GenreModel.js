import { pool } from "../config/dbConn.js";

/**
 * Fetches all genres for caching.
 *
 * @return {Promise<Array>}
 */
const fetchGenres = async () => {
    const query = `
	    SELECT
	        name
	    FROM 
	        Genres
    `;
    try {
	    const { rows } = await pool.query(query);
	    return rows;
    } catch(err) {
	    console.error("Error in GenreModel.fetchGenres:", err);
	    throw err;
    }
}

/**
 * Fetches filtered list of genres for searching.
 *
 * @param {string} term - The search term to filter by.
 * @return {Promise<Array>}
 */
const filterGenres = async (term) => {
    const query = `
        SELECT
            name
        FROM
            Genres
        WHERE
            name LIKE $1
    `;
    const parameters = [`%${term}%`];
    try {
        const { rows } = await pool.query(query, parameters);
        return rows;
    } catch(err) {
        console.error("Error in GenreModel.filterGenres:", err);
        throw err;
    }
}

export {
    fetchGenres,
    filterGenres,
};
