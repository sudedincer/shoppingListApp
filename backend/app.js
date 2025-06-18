const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config'); // Load environment variables from .env
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS to allow cross-origin requests
const cors = require("cors");
app.use(cors({
  origin: '*', // Allow all origins (for development purposes)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

// Import route handlers
const itemRoutes = require('./routes/item');
const userRoutes = require('./routes/user');
const listRoutes = require('./routes/list');

// Mount routes under specific URL paths
app.use('/items', itemRoutes);   // Handle item-related routes
app.use('/users', userRoutes);   // Handle user registration and login
app.use('/lists', listRoutes);   // Handle list-related operations

// Connect to MongoDB using credentials from environment variables
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('connected mongo db');
    // Start server only after DB connection is successful
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));