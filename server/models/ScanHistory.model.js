const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  barcode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: 'Unknown Product',
  },
  productBrand: {
    type: String,
    default: '',
  },
  productImage: {
    type: String,
    default: '',
  },
  ingredientsText: {
    type: String,
    default: '',
  },
  safe: {
    type: Boolean,
    required: true,
  },
  allergenFlags: {
    type: [String],
    default: [],
  },
  aiSummary: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
