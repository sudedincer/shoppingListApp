const express     = require('express');
const mongoose    = require('mongoose');
const List        = require('../schemas/List');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Get all lists belonging to the authenticated user
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log("User:", req.user); // Useful for debugging which user is making the request
    const lists = await List.find({ userEmail: req.user.email });
    res.json(lists);
  } catch (err) {
    console.error('Error fetching lists:', err);
    res.status(500).json({ message: 'Server error while fetching lists.' });
  }
});

// Get a single list by its ID (only if it belongs to the user)
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid list ID.' });
  }

  try {
    const list = await List.findOne({ _id: id, userEmail: req.user.email });
    if (!list) {
      return res.status(404).json({ message: 'List not found.' });
    }
    res.json(list);
  } catch (err) {
    console.error('Error retrieving list by ID:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create a new list for the authenticated user
router.post('/create', verifyToken, async (req, res) => {
  const { name, category, color, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'List name is required.' });
  }

  try {
    const newList = new List({
      name,
      category,
      color,
      description,
      userEmail: req.user.email
    });

    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    console.error('Error creating list:', err);
    res.status(500).json({ message: 'Server error while creating list.' });
  }
});

module.exports = router;