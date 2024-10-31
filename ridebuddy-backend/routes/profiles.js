const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/profiles
// @desc    Get all profiles except the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const profiles = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .lean();

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profiles
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  const { name, age, bio, gender, interests, images, preferences } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.age = age || user.age;
    user.bio = bio || user.bio;
    user.gender = gender || user.gender;
    user.interests = interests || user.interests;
    user.images = images || user.images;
    user.preferences = preferences || user.preferences;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;