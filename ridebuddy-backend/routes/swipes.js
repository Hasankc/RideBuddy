const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Match = require('../models/Match');
const { check, validationResult } = require('express-validator');

// @route   GET /api/swipes/profiles
// @desc    Get profiles to swipe on
// @access  Private
router.get('/profiles', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's preferences
    const { maxDistance, ageRange } = user.settings;
    const { lookingFor } = user.profile;

    // Get already swiped profiles
    const swipedProfiles = await Swipe.find({ userId: req.user.id })
      .select('swipedUserId')
      .lean();
    
    const swipedUserIds = swipedProfiles.map(swipe => swipe.swipedUserId);

    // Find eligible profiles
    const profiles = await User.find({
      _id: { $nin: [...swipedUserIds, req.user.id] },
      'profile.age': { $gte: ageRange.min, $lte: ageRange.max },
      'profile.gender': lookingFor === 'both' ? { $in: ['male', 'female'] } : lookingFor,
      'profile.location': {
        $near: {
          $geometry: user.profile.location,
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    })
    .select('-password')
    .limit(10)
    .lean();

    // Calculate distances
    const profilesWithDistance = profiles.map(profile => {
      const distance = calculateDistance(
        user.profile.location.coordinates,
        profile.profile.location.coordinates
      );
      return { ...profile, distance };
    });

    res.json(profilesWithDistance);
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/swipes
// @desc    Create a new swipe
// @access  Private
router.post(
  '/',
  [
    auth,
    check('swipedUserId', 'Swiped user ID is required').not().isEmpty(),
    check('direction', 'Direction must be left or right').isIn(['left', 'right'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { swipedUserId, direction } = req.body;

      // Create swipe record
      const swipe = new Swipe({
        userId: req.user.id,
        swipedUserId,
        direction
      });

      await swipe.save();

      // Check for match if it's a right swipe
      if (direction === 'right') {
        const otherUserSwipe = await Swipe.findOne({
          userId: swipedUserId,
          swipedUserId: req.user.id,
          direction: 'right'
        });

        if (otherUserSwipe) {
          // Create a match
          const match = new Match({
            users: [req.user.id, swipedUserId],
            matchedAt: new Date()
          });

          await  match.save();

          // Notify both users
          // TODO: Implement notification system

          return res.json({ match: true });
        }
      }

      res.json({ match: false });
    } catch (error) {
      console.error('Error creating swipe:', error);
      res.status(500).send('Server Error');
    }
  }
);

// Helper function to calculate distance between two points
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return d;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

module.exports = router;