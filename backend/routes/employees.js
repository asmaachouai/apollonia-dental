const express  = require('express');
const Employee = require('../models/Employee');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ⚠️ Routes statiques AVANT les routes avec paramètres /:id

// GET users not yet employees (pour le dropdown)
router.get('/available/users', protect, async (req, res) => {
  try {
    const existing  = await Employee.find().select('user');
    const usedIds   = existing.map(e => e.user.toString());
    const available = await User.find({ _id: { $nin: usedIds } }).select('name email role');
    res.json(available);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// READ all
router.get('/', protect, async (req, res) => {
  try {
    const query = {};
    if (req.query.department) query.departments = req.query.department;
    if (req.query.active !== undefined) query.isActive = req.query.active === 'true';
    if (req.query.search) {
      const r = new RegExp(req.query.search, 'i');
      query.$or = [{ firstName: r }, { lastName: r }];
    }
    const employees = await Employee.find(query)
      .populate('user', 'name email role')
      .populate('departments', 'name color')
      .sort({ lastName: 1, firstName: 1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// READ one
router.get('/:id', protect, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('departments', 'name color');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE
router.post('/', protect, async (req, res) => {
  try {
    const { userId, phone, departments } = req.body;
    if (!userId) return res.status(400).json({ message: 'User is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (await Employee.findOne({ user: userId }))
      return res.status(400).json({ message: 'This user is already an employee' });

    const parts     = user.name.trim().split(' ');
    const firstName = parts[0];
    const lastName  = parts.slice(1).join(' ') || parts[0];
    const depts     = Array.isArray(departments) ? departments : departments ? [departments] : [];

    const emp = await Employee.create({
      user: userId, firstName, lastName,
      email: user.email, phone,
      departments: depts,
    });

    const populated = await Employee.findById(emp._id)
      .populate('user', 'name email role')
      .populate('departments', 'name color');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE
router.put('/:id', protect, async (req, res) => {
  try {
    const { departments, phone, isActive } = req.body;
    const update = {};
    if (phone       !== undefined) update.phone       = phone;
    if (isActive    !== undefined) update.isActive    = isActive;
    if (departments !== undefined) update.departments = Array.isArray(departments) ? departments : [departments];

    const emp = await Employee.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    ).populate('user', 'name email role').populate('departments', 'name color');

    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE
router.delete('/:id', protect, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: `${emp.firstName} ${emp.lastName} deleted` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;