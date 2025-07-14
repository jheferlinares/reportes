const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['medicare', 'vida', 'salud', 'seguros_generales']
  },
  leaderId: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);