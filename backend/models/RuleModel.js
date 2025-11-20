import { pool } from '../config/dbConn.js';

/**
 * Fetches all rules.
 *
 * @return {array} - List of all administrative playback rules.
 */
const fetchRules = async () => {
    const query = `
	    SELECT
	        *
    	FROM
	        Rules
    `;
    try {
	    const { rows } = await pool.query(query);
	    return rows;
    } catch (err) {
	    console.error("Error in RuleModel.fetchRules:", err);
	    throw err;
    }
}

/**
 * Fetches only rules for vote skipping.
 *
 * @return {array} - List of administrative playback rules pertaining to vote skipping.
 */
const fetchVoteRules = async () => {
    const query = `
	    SELECT 
	        *
	    FROM
	        Rules
	    WHERE
	        type = 'voting'
    `;
    try {
    	const { rows } = await pool.query(query);
	    return rows;
    } catch(err) {
	    console.error("Error in RuleModel.fetchVoteRules:", err);
    	throw err;
    }
}
