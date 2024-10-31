const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/instagram/photos
// @desc    Get user's Instagram photos
// @access  Private
router.get('/photos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.instagramAccessToken) {
      return res.status(400).json({ msg: 'Instagram not connected' });
    }

    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url&access_token=${user.instagramAccessToken}`);
    const photos = response.data.data
      .filter(item => item.media_type === 'IMAGE')
      .map(item => item.media_url);

    res.json(photos);
  } catch (err) {
    console.error('Error fetching Instagram photos:', err.response ? err.response.data : err.message);
    res.status(500).json({ msg: 'Error fetching Instagram photos' });
  }
});

module.exports = router;