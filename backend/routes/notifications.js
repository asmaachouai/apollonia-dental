const express      = require('express');
const Appointment  = require('../models/Appointment');
const Notification = require('../models/Notification');
const User         = require('../models/User');
const { protect }  = require('../middleware/auth');
const router = express.Router();

// Helper: notifier tous les receptionists
const notifyReceptionists = async (title, message, data = {}) => {
  const receptionists = await User.find({ role: 'receptionist' }).select('_id');
  const notifs = receptionists.map(r => ({
    recipient: r._id, type: 'appointment_cancelled', title, message, data
  }));
  if (notifs.length > 0) await Notification.insertMany(notifs);
};

const apptFilter = (req) =>
  req.user.role === 'admin'        ? {} :
  req.user.role === 'receptionist' ? {} :  // receptionist voit tout
  { doctor: req.user._id };               // doctor voit les siens

router.get('/', protect, async (req, res) => {
  try {
    const filter = apptFilter(req);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date)   filter.date   = { $gte: new Date(req.query.date) };
    const appts = await Appointment.find(filter)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor',  'name email')
      .sort({ date: 1, time: 1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const doctorId = req.user.role === 'doctor' ? req.user._id : req.body.doctor;
    const appt = await Appointment.create({ ...req.body, doctor: doctorId });
    await appt.populate(['patient', 'doctor']);
    res.status(201).json(appt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const prev = await Appointment.findById(req.params.id).populate('patient', 'firstName lastName');
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { returnDocument: 'after' }
    ).populate('patient', 'firstName lastName').populate('doctor', 'name');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Notification si annulation
    if (req.body.status === 'cancelled' && prev?.status !== 'cancelled') {
      const patName = `${appt.patient?.firstName} ${appt.patient?.lastName}`;
      const dateStr = new Date(appt.date).toLocaleDateString('fr-FR');
      await notifyReceptionists(
        'Appointment Cancelled',
        `Appointment for ${patName} on ${dateStr} at ${appt.time} has been cancelled by Dr. ${appt.doctor?.name}.`,
        { appointmentId: appt._id }
      );
    }

    res.json(appt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'name');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Notification suppression
    const patName = `${appt.patient?.firstName} ${appt.patient?.lastName}`;
    const dateStr = new Date(appt.date).toLocaleDateString('fr-FR');
    await notifyReceptionists(
      'Appointment Deleted',
      `Appointment for ${patName} on ${dateStr} at ${appt.time} has been deleted.`,
      { appointmentId: appt._id }
    );

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;