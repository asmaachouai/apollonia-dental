const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['male', 'female', 'other', ''] },
  phone:       { type: String, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  address:     { type: String, trim: true },
  bloodType:   { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] },
  allergies:   { type: String, default: '' },
  notes:       { type: String, default: '' },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // doctor référent (optionnel)
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);