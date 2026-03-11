import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { patientId: '', date: '', time: '', duration: 30, reason: '', notes: '', status: 'scheduled' };

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-slate-100 text-slate-500',
};

export default function Appointments() {
  const { user } = useAuth();
  const isReceptionist = user?.role === 'receptionist';

  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editing,      setEditing]      = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, patRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/patients'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (a) => {
    setForm({
      patientId: a.patient?._id || '',
      date:      a.date ? a.date.slice(0,10) : '',
      time:      a.time || '',
      duration:  a.duration || 30,
      reason:    a.reason || '',
      notes:     a.notes  || '',
      status:    a.status || 'scheduled',
    });
    setEditing(a._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!form.patientId || !form.date || !form.time) {
      setError('Patient, date and time are required'); return;
    }
    try {
      const payload = {
        patient: form.patientId, date: form.date, time: form.time,
        duration: form.duration, reason: form.reason,
        notes: form.notes, status: form.status,
      };
      editing ? await api.put(`/appointments/${editing}`, payload) : await api.post('/appointments', payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving appointment'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    await api.delete(`/appointments/${id}`); load();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/appointments/${id}`, { status }); load();
  };

  const today    = new Date().toISOString().slice(0,10);
  const upcoming = appointments.filter(a => a.date?.slice(0,10) >= today && a.status === 'scheduled');
  const past     = appointments.filter(a => a.date?.slice(0,10) < today  || a.status !== 'scheduled');

  const ApptRow = ({ a }) => (
    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-blue-50 transition-colors bg-white">
      <div className="col-span-3">
        <p className="font-semibold text-slate-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
        <p className="text-xs text-slate-400">{a.patient?.phone || '—'}</p>
      </div>
      <div className="col-span-2 text-sm text-slate-600">
        <p>{a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</p>
        <p className="text-xs text-slate-400">{a.time} · {a.duration}min</p>
      </div>
      <div className="col-span-2 text-xs text-slate-500">{a.doctor?.name || '—'}</div>
      <div className="col-span-2 text-sm text-slate-700 truncate">{a.reason || '—'}</div>
      <div className="col-span-1">
        <select value={a.status}
          onChange={e => handleStatusChange(a._id, e.target.value)}
          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer w-full ${STATUS_COLORS[a.status]}`}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
        </select>
      </div>
      <div className="col-span-2 flex gap-2 justify-end">
        <button onClick={() => openEdit(a)}
          className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Edit</button>
        <button onClick={() => handleDelete(a._id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Del</button>
      </div>
    </div>
  );

  const TableHeader = () => (
    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      <div className="col-span-3">Patient</div>
      <div className="col-span-2">Date & Time</div>
      <div className="col-span-2">Doctor</div>
      <div className="col-span-2">Reason</div>
      <div className="col-span-1">Status</div>
      <div className="col-span-2 text-right">Actions</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-sm text-slate-400 mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New Appointment</button>
      </div>

      {loading ? <p className="text-center text-slate-400 py-20 text-sm">Loading…</p> : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <TableHeader />
              {upcoming.length === 0
                ? <p className="text-center text-slate-400 py-8 text-sm">No upcoming appointments</p>
                : upcoming.map(a => <ApptRow key={a._id} a={a} />)}
            </div>
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-75">
                <TableHeader />
                {past.map(a => <ApptRow key={a._id} a={a} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Appointment' : 'New Appointment'}</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>}
                <div>
                  <label className="label">Patient *</label>
                  <select className="input" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                    <option value="">— Select a patient —</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                  <div><label className="label">Time *</label><input type="time" className="input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <select className="input" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})}>
                    {[15,30,45,60,90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div><label className="label">Reason</label><input className="input" placeholder="e.g. Routine checkup" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
                <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                {editing && (
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Create Appointment'}</button>
                <button onClick={closeModal} className="flex-1 btn-ghost py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}