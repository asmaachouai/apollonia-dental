const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:  { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  date:     { type: Date, required: true },
  time:     { type: String, required: true }, // "09:30"
  duration: { type: Number, default: 30 },    // minutes
  reason:   { type: String, required: true, trim: true },
  notes:    { type: String, default: '' },
  status:   { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);