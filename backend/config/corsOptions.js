const whitelist = [
    'https://coffee-shop-jukebox-frontend.onrender.com',
    'http://localhost:3000',
];

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
}

export default corsOptions;