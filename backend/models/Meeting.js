const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  date:         { type: Date, required: true },
  time:         { type: String, required: true },
  duration:     { type: Number, default: 60 }, // minutes
  location:     { type: String, default: '' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);