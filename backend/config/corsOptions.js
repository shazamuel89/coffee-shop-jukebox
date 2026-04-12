const whitelist = [
    'https://coffee-shop-jukebox-frontend.onrender.com',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
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