// Cross Origin Resource Sharing
const whitelist = [
    'https://coffee-shop-jukebox-frontend.onrender.com'
];

export const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) != -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
}