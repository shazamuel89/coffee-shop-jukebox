// backend/middleware/confirmAdmin.js

export function confirmAdmin(req, res, next) {
    try {
        const user = req.user;

        // Check that user data exists
        if (!user?.spotifyId) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }

        // Ensure that user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Admin privileges required.' });
        }

        // Confirmed that user is an admin, continue
        next();
    } catch(err) {
        console.error('Error in confirmAdmin middleware: ', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
}