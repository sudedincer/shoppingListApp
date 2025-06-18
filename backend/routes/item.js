const express     = require('express');
const router      = express.Router();
const Item        = require('../schemas/Item');
const verifyToken = require('../middlewares/verifyToken');

// Get all items filtered by listId (only for the authenticated user)
router.get('/', verifyToken, async (req, res) => {
  const { listId } = req.query;

  if (!listId) {
    return res.status(400).json({ message: 'listId query parameter is required.' });
  }

  try {
    const items = await Item.find({ listId, userEmail: req.user.email });
    res.json(items);
  } catch (err) {
    console.error('Error while fetching items:', err);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// Create a new item in a specific list
router.post('/create', verifyToken, async (req, res) => {
  const { itemName, quantity, unit, bought, listId } = req.body;

  // Validate required fields
  if (!itemName || typeof quantity !== 'number' || !unit) {
    return res.status(400).json({ message: 'itemName, quantity, and unit are required.' });
  }

  if (!listId) {
    return res.status(400).json({ message: 'listId is required.' });
  }

  try {
    const newItem = await Item.create({
      itemName,
      quantity,
      unit,
      bought: bought || false,
      userEmail: req.user.email,
      listId
    });

    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Error while creating item:', err);
    return res.status(500).json({ message: 'Server error while creating item.' });
  }
});

// Update an item (e.g., toggle "bought" status)
router.patch('/update/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await Item.findOneAndUpdate(
      { _id: id, userEmail: req.user.email },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Item not found or access denied.' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error while updating item:', err);
    res.status(500).json({ message: 'Server error while updating item.' });
  }
});

// Delete an item
router.delete('/delete/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Item.findOneAndDelete({ _id: id, userEmail: req.user.email });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found or access denied.' });
    }

    res.json({ message: 'Item successfully deleted.' });
  } catch (err) {
    console.error('Error while deleting item:', err);
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
});

module.exports = router;