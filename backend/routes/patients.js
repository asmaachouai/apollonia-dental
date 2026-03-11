const express       = require('express');
const Patient       = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const { protect }   = require('../middleware/auth');
const router = express.Router();

// GET all — receptionist/admin voit tout, doctor voit les siens
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      const r = new RegExp(req.query.search, 'i');
      filter.$or = [{ firstName: r }, { lastName: r }];
    }
    const patients = await Patient.find(filter)
      .populate('doctor', 'name email')
      .sort({ lastName: 1 });
    res.json(patients);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET one
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('doctor', 'name email');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE — receptionist + admin seulement
router.post('/', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can create patients' });
    const patient = await Patient.create({ ...req.body });
    res.status(201).json(patient);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE — receptionist + admin
router.put('/:id', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can update patients' });
    const patient = await Patient.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { returnDocument: 'after', runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE — receptionist + admin
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can delete patients' });
    await Patient.findByIdAndDelete(req.params.id);
    await MedicalRecord.deleteMany({ patient: req.params.id });
    res.json({ message: 'Patient deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET records — doctor + admin
router.get('/:id/records', protect, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.id })
      .populate('doctor', 'name')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE record — doctor + admin
router.post('/:id/records', protect, async (req, res) => {
  try {
    if (!['admin', 'doctor'].includes(req.user.role))
      return res.status(403).json({ message: 'Only doctor or admin can add records' });
    const record = await MedicalRecord.create({
      ...req.body, patient: req.params.id, doctor: req.user._id
    });
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE record — doctor + admin
router.put('/:id/records/:rid', protect, async (req, res) => {
  try {
    if (!['admin', 'doctor'].includes(req.user.role))
      return res.status(403).json({ message: 'Only doctor or admin can update records' });
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.rid, { $set: req.body }, { returnDocument: 'after' }
    );
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE record — doctor + admin
router.delete('/:id/records/:rid', protect, async (req, res) => {
  try {
    if (!['admin', 'doctor'].includes(req.user.role))
      return res.status(403).json({ message: 'Only doctor or admin can delete records' });
    await MedicalRecord.findByIdAndDelete(req.params.rid);
    res.json({ message: 'Record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;