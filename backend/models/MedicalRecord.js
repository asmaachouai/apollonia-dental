const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  date:       { type: Date, required: true, default: Date.now },
  diagnosis:  { type: String, required: true, trim: true },
  treatment:  { type: String, default: '' },
  prescription: { type: String, default: '' },
  nextVisit:  { type: Date },
  notes:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);