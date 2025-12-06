import * as TrackModel from '../models/TrackModel.js';
import { AppError } from '../errors/AppError.js';

export const storeTrack = async ({ trackMetadata }) => {
    const result = TrackModel.storeTrack({ track: trackMetadata });
    if (!result) {
        throw new AppError("Track could not be stored in database.");
    }
};