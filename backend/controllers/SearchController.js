// backend/controllers/SearchController.js

import * as SearchService from "../services/SearchService.js";
import validateRequestBodyOrQuery from "../utils/validateRequestBodyOrQuery.js";
import cleanString from "../utils/cleanString.js";
import { BadRequestError } from "../errors/AppError.js";

export const searchTracks = async (req, res) => {
    validateRequestBodyOrQuery({
        data: req.query,
        schema: {
            term: { type: 'string', required: true },
        }
    });

    const term = cleanString({ val: req.query.term });

    if (!term.length) {
        throw new BadRequestError("Search term cannot be empty.");
    }

    const results = await SearchService.searchTracks({ term });

    res.status(200).json(results)
};