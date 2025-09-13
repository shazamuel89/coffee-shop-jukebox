// Main entry point for the backend. Starts the server, loads middleware, registers routes, and connects to the database.


// Initialize express app
const express = require('express');
const app = express();

// Set a single route to get 'Hello world!'
app.get('/', (req, res) => res.send('Hello world!'));

// Either use render's .env port variable, or use 3000
const PORT = process.env.port || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));