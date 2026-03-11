const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['appointment_cancelled', 'appointment_updated', 'meeting_scheduled', 'general'], default: 'general' },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  read:       { type: Boolean, default: false },
  data:       { type: mongoose.Schema.Types.Mixed }, // payload extra (appointmentId etc)
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);