import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { title: '', description: '', date: '', time: '', duration: 60, location: '', participants: [] };

export default function Meetings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [meetings,  setMeetings]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editing,   setEditing]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [meetRes, usersRes] = await Promise.all([
        api.get('/meetings'),
        isAdmin ? api.get('/auth/users') : Promise.resolve({ data: [] }),
      ]);
      setMeetings(meetRes.data);
      setUsers(usersRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (m) => {
    setForm({
      title:        m.title,
      description:  m.description || '',
      date:         m.date ? m.date.slice(0, 10) : '',
      time:         m.time || '',
      duration:     m.duration || 60,
      location:     m.location || '',
      participants: m.participants?.map(p => p._id) || [],
    });
    setEditing(m._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const toggleParticipant = (id) =>
    setForm(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(p => p !== id)
        : [...prev.participants, id],
    }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.date || !form.time) {
      setError('Title, date and time are required'); return;
    }
    try {
      editing ? await api.put(`/meetings/${editing}`, form) : await api.post('/meetings', form);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    await api.delete(`/meetings/${id}`); load();
  };

  const upcoming = meetings.filter(m => new Date(m.date) >= new Date());
  const past     = meetings.filter(m => new Date(m.date) <  new Date());

  const MeetingCard = ({ m }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-800">{m.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(m.date).toLocaleDateString('fr-FR')} · {m.time} · {m.duration}min
            {m.location && ` · ${m.location}`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => openEdit(m)}
              className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Edit</button>
            <button onClick={() => handleDelete(m._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Delete</button>
          </div>
        )}
      </div>
      {m.description && <p className="text-sm text-slate-600 mb-3">{m.description}</p>}
      <div className="flex flex-wrap gap-1.5">
        {m.participants?.map(p => (
          <span key={p._id} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            {p.name}
          </span>
        ))}
        {m.participants?.length === 0 && <span className="text-xs text-slate-400">No participants</span>}
      </div>
      <p className="text-xs text-slate-400 mt-2">Created by {m.createdBy?.name}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meetings</h2>
          <p className="text-sm text-slate-400 mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        {isAdmin && <button onClick={openCreate} className="btn-primary">+ New Meeting</button>}
      </div>

      {loading ? <p className="text-center text-slate-400 py-20 text-sm">Loading…</p> : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h3>
            {upcoming.length === 0
              ? <p className="text-slate-400 text-sm text-center py-8 bg-white rounded-2xl border border-slate-100">No upcoming meetings</p>
              : <div className="space-y-3">{upcoming.map(m => <MeetingCard key={m._id} m={m} />)}</div>}
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h3>
              <div className="space-y-3 opacity-60">{past.map(m => <MeetingCard key={m._id} m={m} />)}</div>
            </div>
          )}
        </div>
      )}

      {/* Modal — admin only */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{editing ? 'Edit Meeting' : 'New Meeting'}</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>}
                <div>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="e.g. Weekly team meeting" value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                  <div><label className="label">Time *</label><input type="time" className="input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Duration (min)</label>
                    <select className="input" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})}>
                      {[30,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div><label className="label">Location</label><input className="input" placeholder="Room / Online" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                </div>
                <div><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div>
                  <label className="label">Participants</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto mt-1">
                    {users.filter(u => u.role !== 'admin').map(u => {
                      const sel = form.participants.includes(u._id);
                      return (
                        <label key={u._id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${sel ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                          <input type="checkbox" checked={sel} onChange={() => toggleParticipant(u._id)} className="w-4 h-4 accent-blue-600" />
                          <span className="text-sm font-medium text-slate-700">{u.name}</span>
                          <span className="ml-auto text-xs text-slate-400 capitalize">{u.role}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Create Meeting'}</button>
                <button onClick={closeModal} className="flex-1 btn-ghost py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}