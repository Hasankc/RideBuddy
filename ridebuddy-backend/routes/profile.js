const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profiles
// @desc    Get profiles for swiping
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const profiles = await User.find({
      _id: { $ne: req.user.id },
      age: { $gte: currentUser.preferences.minAge, $lte: currentUser.preferences.maxAge },
      gender: currentUser.preferences.gender
    }).select('-password');

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profiles/:id
// @desc    Get profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await User.findById(req.params.id).select('-password');
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profiles
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  const { name, age, bio, gender, preferences } = req.body;

  // Build profile object
  const profileFields = {};
  if (name) profileFields.name = name;
  if (age) profileFields.age = age;
  if (bio) profileFields.bio = bio;
  if (gender) profileFields.gender = gender;
  if (preferences) profileFields.preferences = preferences;

  try {
    let profile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;