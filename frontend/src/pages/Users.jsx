import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff' };

const ROLE_COLORS = {
  admin:        'bg-red-100 text-red-700',
  doctor:       'bg-blue-100 text-blue-700',
  staff:        'bg-green-100 text-green-700',
  receptionist: 'bg-purple-100 text-purple-700',
};

export default function Users() {
  const [users,     setUsers]     = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editing,   setEditing]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditing(u._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required'); return;
    }
    if (!editing && !form.password.trim()) {
      setError('Password is required for new users'); return;
    }
    try {
      const payload = {
        name:  form.name.trim(),
        email: form.email.trim(),
        role:  form.role,
        ...(form.password && { password: form.password }),
      };
      editing
        ? await api.put(`/auth/users/${editing}`, payload)
        : await api.post('/auth/register', payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving user'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await api.delete(`/auth/users/${id}`);
    load();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} registered users — admin management only</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add User</button>
      </div>

      {/* Search */}
      <input className="input w-full md:w-80 mb-6" placeholder="Search by name or email…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      {loading ? (
        <p className="text-center text-slate-400 py-20 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((u, i) => (
            <div key={u._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
              </div>
              <div className="col-span-4 text-xs text-slate-400 truncate">{u.email}</div>
              <div className="col-span-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                  {u.role}
                </span>
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <button onClick={() => openEdit(u)}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Edit</button>
                <button onClick={() => handleDelete(u._id, u.name)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  {editing ? 'Edit User' : 'New User'}
                </h3>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-3">

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="e.g. Dr. Sarah Alvarez"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="sarah@apollonia.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>

                <div>
                  <label className="label">
                    Password {editing
                      ? <span className="normal-case font-normal text-slate-400 text-xs">(leave blank to keep)</span>
                      : '*'}
                  </label>
                  <input type="password" className="input" placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>

                <div>
                  <label className="label">Role *</label>
                  <select className="input" value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5">
                  {editing ? 'Update User' : 'Create User'}
                </button>
                <button onClick={closeModal} className="flex-1 btn-ghost py-2.5">
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
