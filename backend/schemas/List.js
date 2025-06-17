const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String, enum: ['genel','market','temizlik','kisisel','elektronik','ev','diger'], default: 'genel' },
  color:       { type: String, default: 'primary' },
  userEmail:   { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('List', ListSchema);