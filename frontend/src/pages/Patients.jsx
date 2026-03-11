import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_PATIENT = { firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '', email: '', address: '', bloodType: '', allergies: '', notes: '', doctor: '' };
const EMPTY_RECORD  = { date: new Date().toISOString().slice(0,10), diagnosis: '', treatment: '', prescription: '', nextVisit: '', notes: '' };

export default function Patients() {
  const { user } = useAuth();
  const canEdit   = ['admin', 'receptionist'].includes(user?.role); // CRUD patients
  const canRecord = ['admin', 'doctor'].includes(user?.role);       // CRUD records
  const isDoctor  = user?.role === 'doctor';

  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [records,      setRecords]      = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [form,         setForm]         = useState(EMPTY_PATIENT);
  const [recordForm,   setRecordForm]   = useState(EMPTY_RECORD);
  const [editingP,     setEditingP]     = useState(null);
  const [editingR,     setEditingR]     = useState(null);
  const [showPatModal, setShowPatModal] = useState(false);
  const [showRecModal, setShowRecModal] = useState(false);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [patRes, usersRes] = await Promise.all([
        api.get('/patients'),
        api.get('/auth/users'),
      ]);
      setPatients(patRes.data);
      setDoctors(usersRes.data.filter(u => u.role === 'doctor'));
    } finally { setLoading(false); }
  };

  const loadRecords = async (patientId) => {
    const { data } = await api.get(`/patients/${patientId}/records`);
    setRecords(data);
  };

  useEffect(() => { load(); }, []);

  const selectPatient = async (p) => {
    setSelected(p);
    await loadRecords(p._id);
  };

  // Patient CRUD
  const openCreateP = () => {
    setForm(EMPTY_PATIENT);
    setEditingP(null); setError(''); setShowPatModal(true);
  };
  const openEditP = (p) => {
    setForm({ ...p, dateOfBirth: p.dateOfBirth?.slice(0,10) || '', doctor: p.doctor?._id || p.doctor || '' });
    setEditingP(p._id); setError(''); setShowPatModal(true);
  };
  const closePatModal = () => { setShowPatModal(false); setForm(EMPTY_PATIENT); setEditingP(null); setError(''); };

  const savePatient = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name required'); return; }
    try {
      editingP ? await api.put(`/patients/${editingP}`, form) : await api.post('/patients', form);
      closePatModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  const deletePatient = async (id, name) => {
    if (!window.confirm(`Delete patient ${name}?`)) return;
    await api.delete(`/patients/${id}`);
    if (selected?._id === id) setSelected(null);
    load();
  };

  // Record CRUD
  const openCreateR = () => { setRecordForm(EMPTY_RECORD); setEditingR(null); setError(''); setShowRecModal(true); };
  const openEditR   = (r) => {
    setRecordForm({ ...r, date: r.date?.slice(0,10) || '', nextVisit: r.nextVisit?.slice(0,10) || '' });
    setEditingR(r._id); setError(''); setShowRecModal(true);
  };
  const closeRecModal = () => { setShowRecModal(false); setRecordForm(EMPTY_RECORD); setEditingR(null); setError(''); };

  const saveRecord = async () => {
    if (!recordForm.diagnosis.trim()) { setError('Diagnosis is required'); return; }
    try {
      editingR
        ? await api.put(`/patients/${selected._id}/records/${editingR}`, recordForm)
        : await api.post(`/patients/${selected._id}/records`, recordForm);
      closeRecModal(); loadRecords(selected._id);
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  const deleteRecord = async (rid) => {
    if (!window.confirm('Delete this record?')) return;
    await api.delete(`/patients/${selected._id}/records/${rid}`);
    loadRecords(selected._id);
  };

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patients</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {patients.length} patients
            {isDoctor && <span className="ml-2 text-blue-500">(read-only — medical records editable)</span>}
          </p>
        </div>
        {canEdit && (
          <button onClick={openCreateP} className="btn-primary">+ Add Patient</button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Patient list */}
        <div className={`${selected ? 'col-span-4' : 'col-span-12'}`}>
          <input className="input w-full mb-4" placeholder="Search by name…"
            value={search} onChange={e => setSearch(e.target.value)} />

          {loading ? <p className="text-slate-400 text-sm text-center py-10">Loading…</p> : (
            <div className="space-y-2">
              {filtered.map(p => (
                <div key={p._id}
                  onClick={() => selectPatient(p)}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                    selected?._id === p._id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                  }`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-400">{p.phone || p.email || '—'}</p>
                    {p.doctor && <p className="text-xs text-blue-500">Dr. {p.doctor?.name || '—'}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEditP(p)}
                        className="bg-amber-400 hover:bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold transition">Edit</button>
                      <button onClick={() => deletePatient(p._id, `${p.firstName} ${p.lastName}`)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold transition">Del</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient detail + records */}
        {selected && (
          <div className="col-span-8">
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">{selected.firstName} {selected.lastName}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  ['DOB',       selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString('fr-FR') : '—'],
                  ['Gender',    selected.gender    || '—'],
                  ['Phone',     selected.phone     || '—'],
                  ['Email',     selected.email     || '—'],
                  ['Blood',     selected.bloodType || '—'],
                  ['Allergies', selected.allergies || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-slate-700 font-medium text-sm">{value}</p>
                  </div>
                ))}
              </div>
              {selected.doctor && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Referring Doctor</p>
                  <p className="text-sm font-semibold text-blue-700">Dr. {selected.doctor?.name || selected.doctor}</p>
                </div>
              )}
            </div>

            {/* Medical Records */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700">Medical Records</h4>
              {canRecord && (
                <button onClick={openCreateR} className="btn-primary text-xs px-4 py-2">+ Add Record</button>
              )}
            </div>

            {/* Doctor read-only notice */}
            {isDoctor && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-700 mb-3">
                You can add and edit medical records for this patient.
              </div>
            )}

            <div className="space-y-3">
              {records.length === 0
                ? <p className="text-slate-400 text-sm text-center py-8 bg-white rounded-2xl border border-slate-100">No records yet</p>
                : records.map(r => (
                  <div key={r._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">{r.diagnosis}</p>
                        <p className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('fr-FR')} · Dr. {r.doctor?.name}</p>
                      </div>
                      {canRecord && (
                        <div className="flex gap-2">
                          <button onClick={() => openEditR(r)}
                            className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">Edit</button>
                          <button onClick={() => deleteRecord(r._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">Del</button>
                        </div>
                      )}
                    </div>
                    {r.treatment    && <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Treatment:</span> {r.treatment}</p>}
                    {r.prescription && <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Prescription:</span> {r.prescription}</p>}
                    {r.nextVisit    && <p className="text-sm text-blue-600"><span className="font-medium">Next visit:</span> {new Date(r.nextVisit).toLocaleDateString('fr-FR')}</p>}
                    {r.notes        && <p className="text-xs text-slate-400 mt-2 italic">{r.notes}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Patient Modal — receptionist/admin */}
      {showPatModal && canEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{editingP ? 'Edit Patient' : 'New Patient'}</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">First Name *</label><input className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                  <div><label className="label">Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                  <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
                  <div>
                    <label className="label">Gender</label>
                    <select className="input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option value="">—</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  <div>
                    <label className="label">Blood Type</label>
                    <select className="input" value={form.bloodType} onChange={e => setForm({...form, bloodType: e.target.value})}>
                      <option value="">—</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Allergies</label><input className="input" value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} /></div>
                </div>
                <div>
                  <label className="label">Assign to Doctor</label>
                  <select className="input" value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}>
                    <option value="">— Select a doctor —</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={savePatient} className="flex-1 btn-primary py-2.5">{editingP ? 'Update Patient' : 'Create Patient'}</button>
                <button onClick={closePatModal} className="flex-1 btn-ghost py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Modal — doctor/admin */}
      {showRecModal && canRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{editingR ? 'Edit Record' : 'New Medical Record'}</h3>
                <p className="text-xs text-slate-400 mt-1">{selected?.firstName} {selected?.lastName}</p>
              </div>
              <div className="px-6 py-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Date</label><input type="date" className="input" value={recordForm.date} onChange={e => setRecordForm({...recordForm, date: e.target.value})} /></div>
                  <div><label className="label">Next Visit</label><input type="date" className="input" value={recordForm.nextVisit} onChange={e => setRecordForm({...recordForm, nextVisit: e.target.value})} /></div>
                </div>
                <div><label className="label">Diagnosis *</label><input className="input" placeholder="e.g. Dental caries" value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} /></div>
                <div><label className="label">Treatment</label><textarea className="input resize-none" rows={2} value={recordForm.treatment} onChange={e => setRecordForm({...recordForm, treatment: e.target.value})} /></div>
                <div><label className="label">Prescription</label><textarea className="input resize-none" rows={2} value={recordForm.prescription} onChange={e => setRecordForm({...recordForm, prescription: e.target.value})} /></div>
                <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} /></div>
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={saveRecord} className="flex-1 btn-primary py-2.5">{editingR ? 'Update Record' : 'Add Record'}</button>
                <button onClick={closeRecModal} className="flex-1 btn-ghost py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}