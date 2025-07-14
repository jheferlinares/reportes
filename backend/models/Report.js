const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  cantidadVentas: {
    type: Number,
    default: 0
  },
  montoVentas: {
    type: Number,
    default: 0
  },
  descripcion: {
    type: String,
    default: ''
  },
  comentarios: {
    type: String,
    default: ''
  },
  leaderId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);