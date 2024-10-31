const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    bio: {
      type: String,
      default: '',
      maxLength: 500
    },
    images: [{
      url: String,
      isMain: Boolean
    }],
    age: {
      type: Number,
      min: 18,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    lookingFor: {
      type: String,
      enum: ['male', 'female', 'both', 'other']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    interests: [String]
  },
  settings: {
    maxDistance: {
      type: Number,
      default: 50, // in kilometers
      min: 1,
      max: 100
    },
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18,
        max: 120
      },
      max: {
        type: Number,
        default: 100,
        min: 18,
        max: 120
      }
    },
    notifications: {
      matches: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      }
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
UserSchema.index({ "profile.location": "2dsphere" });

// Method to transform user object before sending to client
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);