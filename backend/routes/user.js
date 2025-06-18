const express = require('express');
const ToDo = require('../schemas/Item'); // Not directly used in this file
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../schemas/User');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', async (req, res) => {
  const data = req.body;

  // Validate email and password presence
  if (!data.email && !data.password) {
    return res.status(400).json('Email and password cannot be empty!');
  }

  const user = new User(data);

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const createdUser = await user.save();

  res.status(201).json({
    id: createdUser._id,
    email: createdUser.email,
  });
});

// Login an existing user
router.post('/login', async (req, res, next) => {
  try {
    const data = req.body;

    // Validate input
    if (!data.email && !data.password) {
      return res.status(400).json({ message: 'Email and password cannot be empty!', status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!', status: 404 });
    }

    // Compare given password with hashed password
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return next(res.status(400).json({ message: 'Invalid email or password!', status: 400 }));
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.header('token', token); 

    return res.json({
      data: {
        message: 'Login successful.',
        access_token: token
      },
      status: 200
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
});

module.exports = router;