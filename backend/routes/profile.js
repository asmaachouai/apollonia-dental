const express     = require('express');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/profile
router.get('/', protect, async (req, res) => {
  res.json(req.user);
});

// PUT /api/profile
router.put('/', protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (name)  user.name  = name;
    if (email) user.email = email;
    if (password) user.password = password; // pre-save hashes it
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;