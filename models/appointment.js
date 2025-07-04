const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  date: String,
  time: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
videoEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);