const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['leader', 'boss', 'pending'],
    required: true
  },
  department: {
    type: String,
    enum: ['medicare', 'vida', 'salud', 'seguros_generales', 'all'],
    required: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  active: {
    type: Boolean,
    default: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);