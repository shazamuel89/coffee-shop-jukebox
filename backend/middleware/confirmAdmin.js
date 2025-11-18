// backend/middleware/confirmAdmin.js

import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

export function confirmAdmin(req, _res, next) {
    const user = req.user;

    // Check that user data exists
    if (!user?.spotifyId) {
        throw new UnauthorizedError("Not authenticated.");
    }

    // Ensure that user is an admin
    if (!user.isAdmin) {
        throw new ForbiddenError("Admin privileges required.");
    }

    // Confirmed that user is an admin, continue
    next();
}