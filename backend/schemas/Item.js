// schemas/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemName:  { type: String, required: true },
  quantity:  { type: Number, required: true },
  unit:      { type: String, required: true },
  bought:    { type: Boolean, default: false },
  userEmail: { type: String, required: true },
  listId:    { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Item', ItemSchema);