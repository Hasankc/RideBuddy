const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

// @route   POST /api/upload
// @desc    Upload user image
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload an image file' });
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString('base64');
    const fileType = req.file.mimetype;

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${fileType};base64,${fileStr}`,
      {
        folder: 'ridebuddy/users',
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      }
    );

    // Get user
    const user = await User.findById(req.user.id);
    
    // Add image to user's profile
    const newImage = {
      url: uploadResponse.secure_url,
      isMain: user.profile.images.length === 0 // First image is main by default
    };

    user.profile.images.push(newImage);
    await user.save();

    res.json({
      msg: 'Image uploaded successfully',
      image: newImage
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      msg: 'Error uploading image',
      error: error.message
    });
  }
});

// @route   DELETE /api/upload/:imageId
// @desc    Delete user image
// @access  Private
router.delete('/:imageId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find image index
    const imageIndex = user.profile.images.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Get Cloudinary public ID from URL
    const publicId = user.profile.images[imageIndex].url
      .split('/')
      .slice(-1)[0]
      .split('.')[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(`ridebuddy/users/${publicId}`);

    // Remove image from user's profile
    user.profile.images.splice(imageIndex, 1);

    // If deleted image was main and other images exist, set first remaining image as main
    if (user.profile.images.length > 0 && user.profile.images[imageIndex].isMain) {
      user.profile.images[0].isMain = true;
    }

    await user.save();

    res.json({ msg: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      msg: 'Error deleting image',
      error: error.message
    });
  }
});

// @route   PUT /api/upload/:imageId/main
// @desc    Set image as main profile image
// @access  Private
router.put('/:imageId/main', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Reset all images to non-main
    user.profile.images.forEach(img => {
      img.isMain = img._id.toString() === req.params.imageId;
    });

    await user.save();

    res.json({ msg: 'Main image updated successfully' });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      msg: 'Error updating main image',
      error: error.message
    });
  }
});

module.exports = router;