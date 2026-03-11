const express     = require('express');
const Meeting     = require('../models/Meeting');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Doctor voit ses meetings, admin voit tout
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { participants: req.user._id };
    const meetings = await Meeting.find(filter)
      .populate('createdBy',    'name')
      .populate('participants', 'name role')
      .sort({ date: 1 });
    res.json(meetings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can create meetings' });
    const meeting = await Meeting.create({ ...req.body, createdBy: req.user._id });
    await meeting.populate(['createdBy', 'participants']);
    res.status(201).json(meeting);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can update meetings' });
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { returnDocument: 'after' }
    ).populate('createdBy', 'name').populate('participants', 'name role');
    res.json(meeting);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can delete meetings' });
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;