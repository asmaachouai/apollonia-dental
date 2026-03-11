const mongoose = require('mongoose');

// Based on Apollonia Dental Practice briefing — 10 employees:
// Lisa Harris, Alfred Christensen, John Dudley, Danny Perez,
// Sarah Alvarez, Constance Smith, Travis Combs, Francisco Willard,
// Janet Doe, Leslie Roche
//
// NOTE: Lisa Harris appears in BOTH Restorative Dentistry AND Orthodontics
// → departments is an ARRAY to support multi-department assignment
//
// NOTE: Travis Combs has NO department in the briefing → departments can be empty




// Employee est lié à un User via userId
const employeeSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  phone:       { type: String, default: '' },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

employeeSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);