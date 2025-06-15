const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');
const PORT = process.env.PORT || 3000;
const app = express();

// JSON parsing middleware
app.use(express.json());
const cors = require("cors");

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Routes
const itemRoutes = require('./routes/item');
const userRoutes = require('./routes/user');
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

// MongoDB bağlantısı (promise tabanlı)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('connected mongo db');
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
