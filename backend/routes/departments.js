const express    = require('express');
const Department = require('../models/Department');
const Employee   = require('../models/Employee');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Task 3 hint: abstract DB query into reusable helper function
const getAllDepartments = async () => {
  const depts = await Department.find().sort({ name: 1 });
  return Promise.all(depts.map(async d => ({
    ...d.toObject(),
    employeeCount: await Employee.countDocuments({ departments: d._id })
  })));
};

// READ all — GET /api/departments
router.get('/', protect, async (req, res) => {
  try { res.json(await getAllDepartments()); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// READ one — GET /api/departments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const employees = await Employee.find({ departments: dept._id }).select('firstName lastName isActive');
    res.json({ ...dept.toObject(), employees });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE — POST /api/departments
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });
    if (await Department.findOne({ name: name.trim() }))
      return res.status(400).json({ message: 'Department already exists' });
    const dept = await Department.create({ name: name.trim(), description, color });
    res.status(201).json(dept);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE — PUT /api/departments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { $set: req.body }, { returnDocument: 'after', runValidators: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE — DELETE /api/departments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const count = await Employee.countDocuments({ departments: req.params.id });
    if (count > 0) return res.status(400).json({ message: `Cannot delete — ${count} employee(s) assigned` });
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;