const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  matched: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('match', MatchSchema);