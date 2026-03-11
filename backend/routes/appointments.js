const express      = require('express');
const Appointment  = require('../models/Appointment');
const Notification = require('../models/Notification');
const User         = require('../models/User');
const { protect }  = require('../middleware/auth');
const router = express.Router();

// Notifier les receptionists
const notifyReceptionists = async (title, message, data = {}) => {
  const receptionists = await User.find({ role: 'receptionist' }).select('_id');
  if (receptionists.length > 0)
    await Notification.insertMany(receptionists.map(r => ({
      recipient: r._id, type: 'appointment_cancelled', title, message, data
    })));
};

// Notifier le doctor concerné
const notifyDoctor = async (doctorId, title, message, data = {}) => {
  await Notification.create({
    recipient: doctorId, type: 'appointment_updated', title, message, data
  });
};

// GET all — tous les rôles voient les RDV
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    // Doctor voit uniquement ses RDV
    if (req.user.role === 'doctor') filter.doctor = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date)   filter.date   = { $gte: new Date(req.query.date) };
    const appts = await Appointment.find(filter)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor',  'name email')
      .sort({ date: 1, time: 1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE — receptionist + admin seulement
router.post('/', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can create appointments' });

    const appt = await Appointment.create(req.body);
    await appt.populate([
      { path: 'patient', select: 'firstName lastName' },
      { path: 'doctor',  select: 'name email' }
    ]);

    // Notifier le doctor qu'un RDV lui a été assigné
    if (appt.doctor) {
      const patName = `${appt.patient?.firstName} ${appt.patient?.lastName}`;
      const dateStr = new Date(appt.date).toLocaleDateString('fr-FR');
      await notifyDoctor(
        appt.doctor._id,
        'New Appointment Assigned',
        `A new appointment has been scheduled for ${patName} on ${dateStr} at ${appt.time}.`,
        { appointmentId: appt._id }
      );
    }
    res.status(201).json(appt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE — receptionist + admin
router.put('/:id', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can update appointments' });

    const prev = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('doctor',  'name _id');

    const appt = await Appointment.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { returnDocument: 'after' }
    ).populate('patient', 'firstName lastName').populate('doctor', 'name _id');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const patName = `${appt.patient?.firstName} ${appt.patient?.lastName}`;
    const dateStr = new Date(appt.date).toLocaleDateString('fr-FR');
    const doctorId = appt.doctor?._id;

    // Annulation → notifier receptionists
    if (req.body.status === 'cancelled' && prev?.status !== 'cancelled') {
      await notifyReceptionists(
        'Appointment Cancelled',
        `Appointment for ${patName} on ${dateStr} at ${appt.time} has been cancelled.`,
        { appointmentId: appt._id }
      );
    }

    // Changement de date/heure → notifier le doctor
    if (doctorId && (req.body.date || req.body.time || req.body.status)) {
      const changes = [];
      if (req.body.date   && req.body.date   !== prev?.date?.toISOString().slice(0,10)) changes.push(`date → ${dateStr}`);
      if (req.body.time   && req.body.time   !== prev?.time)   changes.push(`time → ${appt.time}`);
      if (req.body.status && req.body.status !== prev?.status) changes.push(`status → ${req.body.status}`);
      if (changes.length > 0) {
        await notifyDoctor(
          doctorId,
          'Appointment Updated',
          `Appointment for ${patName} has been updated: ${changes.join(', ')}.`,
          { appointmentId: appt._id }
        );
      }
    }

    res.json(appt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE — receptionist + admin
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!['admin', 'receptionist'].includes(req.user.role))
      return res.status(403).json({ message: 'Only receptionist or admin can delete appointments' });

    const appt = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('doctor',  'name _id');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const patName = `${appt.patient?.firstName} ${appt.patient?.lastName}`;
    const dateStr = new Date(appt.date).toLocaleDateString('fr-FR');

    // Notifier receptionists
    await notifyReceptionists(
      'Appointment Deleted',
      `Appointment for ${patName} on ${dateStr} at ${appt.time} has been deleted.`,
      { appointmentId: appt._id }
    );

    // Notifier le doctor
    if (appt.doctor?._id) {
      await notifyDoctor(
        appt.doctor._id,
        'Appointment Cancelled',
        `Your appointment with ${patName} on ${dateStr} at ${appt.time} has been cancelled by reception.`,
        { appointmentId: appt._id }
      );
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;