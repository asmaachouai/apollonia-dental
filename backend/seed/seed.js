require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose      = require('mongoose');
const Department    = require('../models/Department');
const Employee      = require('../models/Employee');
const User          = require('../models/User');
const Patient       = require('../models/Patient');
const Appointment   = require('../models/Appointment');
const Meeting       = require('../models/Meeting');
const MedicalRecord = require('../models/MedicalRecord');
const Notification  = require('../models/Notification');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apollonia');
  console.log('✅ Connected to MongoDB');

  // Clear all
  await Promise.all([
    Department.deleteMany({}),
    Employee.deleteMany({}),
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Meeting.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑  Cleared all collections');

  /* ── 1. DEPARTMENTS ──────────────────────────────────── */
  const depts = await Department.insertMany([
    { name: 'General Dentistry',     description: 'Routine check-ups and preventive care', color: '#2563EB' },
    { name: 'Pediatric Dentistry',   description: 'Dental care for children',              color: '#16A34A' },
    { name: 'Restorative Dentistry', description: 'Fillings, crowns and restoration',      color: '#D97706' },
    { name: 'Surgery',               description: 'Extractions and surgical procedures',   color: '#DC2626' },
    { name: 'Orthodontics',          description: 'Braces and corrective treatments',      color: '#7C3AED' },
  ]);
  const D = {};
  depts.forEach(d => { D[d.name] = d._id; });
  console.log('✅ 5 departments');

  /* ── 2. USERS ────────────────────────────────────────── */
  const usersData = [
    // Admin
    { name: 'Admin Apollonia',    email: 'admin@apollonia.com',       password: 'Admin1234!',  role: 'admin' },
    // Doctors
    { name: 'Sarah Alvarez',      email: 'sarah@apollonia.com',       password: 'Doctor1234!', role: 'doctor' },
    { name: 'Alfred Christensen', email: 'alfred@apollonia.com',      password: 'Doctor1234!', role: 'doctor' },
    { name: 'John Dudley',        email: 'john@apollonia.com',        password: 'Doctor1234!', role: 'doctor' },
    { name: 'Danny Perez',        email: 'danny@apollonia.com',       password: 'Doctor1234!', role: 'doctor' },
    { name: 'Lisa Harris',        email: 'lisa@apollonia.com',        password: 'Doctor1234!', role: 'doctor' },
    // Staff
    { name: 'Constance Smith',    email: 'constance@apollonia.com',   password: 'Staff1234!',  role: 'staff' },
    { name: 'Travis Combs',       email: 'travis@apollonia.com',      password: 'Staff1234!',  role: 'staff' },
    { name: 'Francisco Willard',  email: 'francisco@apollonia.com',   password: 'Staff1234!',  role: 'staff' },
    // Receptionists
    { name: 'Janet Doe',          email: 'janet@apollonia.com',       password: 'Recept1234!', role: 'receptionist' },
    { name: 'Leslie Roche',       email: 'leslie@apollonia.com',      password: 'Recept1234!', role: 'receptionist' },
  ];

  const users = [];
  for (const u of usersData) {
    users.push(await User.create(u));
  }
  const U = {};
  users.forEach(u => { U[u.name] = u; });
  console.log(`✅ ${users.length} users`);

  /* ── 3. EMPLOYEES ────────────────────────────────────── */
  const splitName = (name) => {
    const parts = name.trim().split(' ');
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') || parts[0] };
  };

  const employeesData = [
    { user: U['Alfred Christensen'], departments: [D['General Dentistry']] },
    { user: U['John Dudley'],        departments: [D['General Dentistry']] },
    { user: U['Janet Doe'],          departments: [D['General Dentistry']] },
    { user: U['Francisco Willard'],  departments: [D['Pediatric Dentistry']] },
    { user: U['Sarah Alvarez'],      departments: [D['Pediatric Dentistry']] },
    { user: U['Lisa Harris'],        departments: [D['Restorative Dentistry'], D['Orthodontics']] },
    { user: U['Danny Perez'],        departments: [D['Restorative Dentistry']] },
    { user: U['Constance Smith'],    departments: [D['Surgery']] },
    { user: U['Leslie Roche'],       departments: [D['Orthodontics']] },
    { user: U['Travis Combs'],       departments: [] },
  ];

  for (const e of employeesData) {
    const { firstName, lastName } = splitName(e.user.name);
    await Employee.create({
      user: e.user._id, firstName, lastName,
      email: e.user.email, departments: e.departments,
    });
  }
  console.log(`✅ ${employeesData.length} employees`);

  /* ── 4. PATIENTS ─────────────────────────────────────── */
  const patientsData = await Patient.insertMany([
    {
      firstName: 'Mohammed', lastName: 'Alami',
      dateOfBirth: new Date('1985-03-12'), gender: 'male',
      phone: '+212 6 12 34 56 78', email: 'alami@email.com',
      bloodType: 'A+', allergies: 'Penicillin',
      doctor: U['Sarah Alvarez']._id,
      notes: 'Regular checkup patient',
    },
    {
      firstName: 'Fatima', lastName: 'Benali',
      dateOfBirth: new Date('1992-07-22'), gender: 'female',
      phone: '+212 6 98 76 54 32', email: 'benali@email.com',
      bloodType: 'O+', allergies: '',
      doctor: U['Sarah Alvarez']._id,
    },
    {
      firstName: 'Youssef', lastName: 'Idrissi',
      dateOfBirth: new Date('1978-11-05'), gender: 'male',
      phone: '+212 6 55 44 33 22',
      bloodType: 'B+',
      doctor: U['Alfred Christensen']._id,
    },
    {
      firstName: 'Amina', lastName: 'Cherkaoui',
      dateOfBirth: new Date('2010-04-18'), gender: 'female',
      phone: '+212 6 11 22 33 44',
      bloodType: 'AB-',
      doctor: U['John Dudley']._id,
      notes: 'Child patient — Pediatric',
    },
    {
      firstName: 'Khalid', lastName: 'Mansouri',
      dateOfBirth: new Date('1965-09-30'), gender: 'male',
      phone: '+212 6 77 88 99 00',
      bloodType: 'O-', allergies: 'Latex',
      doctor: U['Danny Perez']._id,
    },
    {
      firstName: 'Zineb', lastName: 'Tazi',
      dateOfBirth: new Date('1998-01-14'), gender: 'female',
      phone: '+212 6 33 44 55 66', email: 'tazi@email.com',
      bloodType: 'A-',
      doctor: U['Lisa Harris']._id,
    },
  ]);
  const P = {};
  patientsData.forEach(p => { P[`${p.firstName} ${p.lastName}`] = p; });
  console.log(`✅ ${patientsData.length} patients`);

  /* ── 5. MEDICAL RECORDS ──────────────────────────────── */
  await MedicalRecord.insertMany([
    {
      patient:      P['Mohammed Alami']._id,
      doctor:       U['Sarah Alvarez']._id,
      date:         new Date('2025-10-15'),
      diagnosis:    'Dental caries — lower left molar',
      treatment:    'Composite filling applied',
      prescription: 'Ibuprofen 400mg — 3 days',
      nextVisit:    new Date('2026-04-15'),
      notes:        'Monitor adjacent tooth',
    },
    {
      patient:      P['Mohammed Alami']._id,
      doctor:       U['Sarah Alvarez']._id,
      date:         new Date('2025-06-10'),
      diagnosis:    'Routine cleaning',
      treatment:    'Scaling and polishing',
      nextVisit:    new Date('2025-12-10'),
    },
    {
      patient:      P['Fatima Benali']._id,
      doctor:       U['Sarah Alvarez']._id,
      date:         new Date('2025-11-20'),
      diagnosis:    'Gingivitis — mild',
      treatment:    'Deep cleaning, oral hygiene instructions',
      prescription: 'Chlorhexidine mouthwash — 2 weeks',
      nextVisit:    new Date('2026-02-20'),
    },
    {
      patient:      P['Youssef Idrissi']._id,
      doctor:       U['Alfred Christensen']._id,
      date:         new Date('2025-12-05'),
      diagnosis:    'Tooth sensitivity — upper right',
      treatment:    'Desensitizing toothpaste recommended',
      nextVisit:    new Date('2026-06-05'),
    },
    {
      patient:      P['Zineb Tazi']._id,
      doctor:       U['Lisa Harris']._id,
      date:         new Date('2026-01-08'),
      diagnosis:    'Malocclusion — Class II',
      treatment:    'Orthodontic treatment initiated — metal braces',
      nextVisit:    new Date('2026-02-08'),
      notes:        'Monthly follow-up required',
    },
  ]);
  console.log('5 medical records');

  /* ── 6. APPOINTMENTS ─────────────────────────────────── */
  const today = new Date();
  const d = (offset, h = 9, m = 0) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    dt.setHours(h, m, 0, 0);
    return dt;
  };

  await Appointment.insertMany([
    // Aujourd'hui
    {
      patient: P['Mohammed Alami']._id, doctor: U['Sarah Alvarez']._id,
      date: d(0, 9, 0), time: '09:00', duration: 30,
      reason: 'Follow-up filling check', status: 'scheduled',
    },
    {
      patient: P['Fatima Benali']._id, doctor: U['Sarah Alvarez']._id,
      date: d(0, 10, 0), time: '10:00', duration: 45,
      reason: 'Gingivitis follow-up', status: 'scheduled',
    },
    {
      patient: P['Youssef Idrissi']._id, doctor: U['Alfred Christensen']._id,
      date: d(0, 11, 0), time: '11:00', duration: 30,
      reason: 'Sensitivity check', status: 'completed',
    },
    // Demain
    {
      patient: P['Amina Cherkaoui']._id, doctor: U['John Dudley']._id,
      date: d(1, 9, 30), time: '09:30', duration: 30,
      reason: 'Pediatric routine checkup', status: 'scheduled',
    },
    {
      patient: P['Khalid Mansouri']._id, doctor: U['Danny Perez']._id,
      date: d(1, 14, 0), time: '14:00', duration: 60,
      reason: 'Crown preparation', status: 'scheduled',
    },
    // Dans 3 jours
    {
      patient: P['Zineb Tazi']._id, doctor: U['Lisa Harris']._id,
      date: d(3, 10, 0), time: '10:00', duration: 45,
      reason: 'Braces adjustment', status: 'scheduled',
    },
    {
      patient: P['Mohammed Alami']._id, doctor: U['Sarah Alvarez']._id,
      date: d(3, 15, 0), time: '15:00', duration: 30,
      reason: 'Annual checkup', status: 'scheduled',
    },
    // Passés
    {
      patient: P['Fatima Benali']._id, doctor: U['Sarah Alvarez']._id,
      date: d(-7, 9, 0), time: '09:00', duration: 30,
      reason: 'Initial consultation', status: 'completed',
    },
    {
      patient: P['Khalid Mansouri']._id, doctor: U['Danny Perez']._id,
      date: d(-3, 11, 0), time: '11:00', duration: 30,
      reason: 'X-ray consultation', status: 'completed',
    },
    {
      patient: P['Amina Cherkaoui']._id, doctor: U['John Dudley']._id,
      date: d(-1, 14, 0), time: '14:00', duration: 30,
      reason: 'Tooth extraction consultation', status: 'cancelled',
    },
  ]);
  console.log('✅ 10 appointments (today + upcoming + past)');

  /* ── 7. MEETINGS ─────────────────────────────────────── */
  await Meeting.insertMany([
    {
      title:       'Weekly Staff Meeting',
      description: 'Weekly review of patient cases and department updates',
      date:        d(2, 8, 0),
      time:        '08:00',
      duration:    60,
      location:    'Conference Room A',
      createdBy:   U['Admin Apollonia']._id,
      participants: [
        U['Sarah Alvarez']._id, U['Alfred Christensen']._id,
        U['John Dudley']._id,   U['Danny Perez']._id,
        U['Lisa Harris']._id,
      ],
    },
    {
      title:       'Orthodontics Department Review',
      description: 'Monthly case review for orthodontics department',
      date:        d(5, 14, 0),
      time:        '14:00',
      duration:    90,
      location:    'Room 3',
      createdBy:   U['Admin Apollonia']._id,
      participants: [U['Lisa Harris']._id, U['Danny Perez']._id],
    },
    {
      title:       'Pediatric Care Training',
      description: 'Workshop on latest pediatric dental techniques',
      date:        d(10, 9, 0),
      time:        '09:00',
      duration:    120,
      location:    'Training Room',
      createdBy:   U['Admin Apollonia']._id,
      participants: [U['John Dudley']._id, U['Alfred Christensen']._id],
    },
    {
      title:       'Q1 Planning Meeting',
      description: 'Quarterly planning and objectives review',
      date:        d(-5, 10, 0),
      time:        '10:00',
      duration:    60,
      location:    'Conference Room A',
      createdBy:   U['Admin Apollonia']._id,
      participants: [
        U['Sarah Alvarez']._id, U['Alfred Christensen']._id,
        U['John Dudley']._id,   U['Danny Perez']._id,
        U['Lisa Harris']._id,
      ],
    },
  ]);
  console.log('4 meetings (upcoming + past)');

  /* ── 8. NOTIFICATIONS TEST ───────────────────────────── */
  await Notification.insertMany([
    {
      recipient: U['Janet Doe']._id,
      type:      'appointment_cancelled',
      title:     'Appointment Cancelled',
      message:   `Appointment for Amina Cherkaoui on ${d(-1).toLocaleDateString('fr-FR')} at 14:00 has been cancelled.`,
      read:      false,
    },
    {
      recipient: U['Leslie Roche']._id,
      type:      'appointment_cancelled',
      title:     'Appointment Cancelled',
      message:   `Appointment for Amina Cherkaoui on ${d(-1).toLocaleDateString('fr-FR')} at 14:00 has been cancelled.`,
      read:      false,
    },
    {
      recipient: U['John Dudley']._id,
      type:      'appointment_updated',
      title:     'Appointment Cancelled',
      message:   'Your appointment with Amina Cherkaoui has been cancelled by reception.',
      read:      false,
    },
    {
      recipient: U['Sarah Alvarez']._id,
      type:      'appointment_updated',
      title:     'New Appointment Assigned',
      message:   `A new appointment has been scheduled for Mohammed Alami on ${d(3).toLocaleDateString('fr-FR')} at 15:00.`,
      read:      false,
    },
  ]);
  console.log('4 test notifications');

  /* ── SUMMARY ─────────────────────────────────────────── */
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Apollonia seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nLOGINS:');
  console.log('   Admin       : admin@apollonia.com      / Admin1234!');
  console.log('   Doctor      : sarah@apollonia.com      / Doctor1234!');
  console.log('   Doctor      : alfred@apollonia.com     / Doctor1234!');
  console.log('   Doctor      : john@apollonia.com       / Doctor1234!');
  console.log('   Doctor      : danny@apollonia.com      / Doctor1234!');
  console.log('   Doctor      : lisa@apollonia.com       / Doctor1234!');
  console.log('   Receptionist: janet@apollonia.com      / Recept1234!');
  console.log('   Receptionist: leslie@apollonia.com     / Recept1234!');
  console.log('   Staff       : constance@apollonia.com  / Staff1234!');
  console.log('\nDATA:');
  console.log('   5 departments · 10 employees · 11 users');
  console.log('   6 patients · 5 medical records');
  console.log('   10 appointments (3 today, 4 upcoming, 3 past)');
  console.log('   4 meetings (3 upcoming, 1 past)');
  console.log('   4 notifications (2 receptionists, 2 doctors)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed error:', err.message); process.exit(1); });