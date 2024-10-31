const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');

// @route   GET api/matches
// @desc    Get all matches for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({ $or: [{ user1: req.user.id }, { user2: req.user.id }] })
      .populate('user1', 'name')
      .populate('user2', 'name');

    const formattedMatches = matches.map(match => {
      const otherUser = match.user1._id.toString() === req.user.id ? match.user2 : match.user1;
      return {
        _id: otherUser._id,
        name: otherUser.name,
        lastMessage: match.lastMessage || ''
      };
    });

    res.json(formattedMatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;