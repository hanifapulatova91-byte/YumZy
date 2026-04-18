const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  quizAnswers: {
    skinReaction: { type: Boolean, default: false },
    stomachIssues: { type: Boolean, default: false },
    symptomSpeed: {
      type: String,
      enum: ['immediate', '30-60min', 'later', ''],
      default: '',
    },
    processedFoodFreq: {
      type: String,
      enum: ['often', 'sometimes', 'rarely', ''],
      default: '',
    },
  },
  allergens: {
    type: [String],
    default: [],
    // Standard allergens: 'peanuts', 'milk', 'gluten', 'eggs', 'seafood'
  },
  customAllergens: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
