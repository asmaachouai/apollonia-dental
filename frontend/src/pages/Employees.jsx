import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { userId: '', phone: '', departments: [] };

const DEPT_COLORS = {
  'General Dentistry':     'bg-blue-100 text-blue-700',
  'Pediatric Dentistry':   'bg-green-100 text-green-700',
  'Restorative Dentistry': 'bg-amber-100 text-amber-700',
  'Surgery':               'bg-red-100 text-red-700',
  'Orthodontics':          'bg-purple-100 text-purple-700',
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700', receptionist: 'bg-purple-100 text-purple-700',
};

export default function Employees() {
  const [employees,       setEmployees]       = useState([]);
  const [departments,     setDepartments]     = useState([]);
  const [availableUsers,  setAvailableUsers]  = useState([]);
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [editing,         setEditing]         = useState(null);
  const [showModal,       setShowModal]       = useState(false);
  const [search,          setSearch]          = useState('');
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');

  // Preview des champs auto-remplis
  const [preview, setPreview] = useState({ name: '', email: '', role: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } finally { setLoading(false); }
  };

  const loadAvailableUsers = async () => {
    try {
      const { data } = await api.get('/employees/available/users');
      setAvailableUsers(data);
    } catch { setAvailableUsers([]); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = async () => {
    await loadAvailableUsers();
    setForm(EMPTY_FORM);
    setPreview({ name: '', email: '', role: '' });
    setEditing(null); setError(''); setShowModal(true);
  };

  const openEdit = (emp) => {
    setForm({
      userId:      emp.user?._id || '',
      phone:       emp.phone || '',
      departments: emp.departments?.map(d => d._id) || [],
    });
    setPreview({
      name:  emp.user?.name || `${emp.firstName} ${emp.lastName}`,
      email: emp.user?.email || emp.email || '',
      role:  emp.user?.role || '',
    });
    setEditing(emp._id); setError(''); setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setForm(EMPTY_FORM);
    setPreview({ name: '', email: '', role: '' });
    setEditing(null); setError('');
  };

  // Quand l'admin sélectionne un user → auto-fill preview
  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setForm({ ...form, userId });
    if (!userId) { setPreview({ name: '', email: '', role: '' }); return; }
    const user = availableUsers.find(u => u._id === userId);
    if (user) setPreview({ name: user.name, email: user.email, role: user.role });
  };

  const toggleDept = (id) =>
    setForm(prev => ({
      ...prev,
      departments: prev.departments.includes(id)
        ? prev.departments.filter(d => d !== id)
        : [...prev.departments, id],
    }));

  const handleSave = async () => {
    if (!editing && !form.userId) {
      setError('Please select a user'); return;
    }
    try {
      const payload = {
        userId:      form.userId,
        phone:       form.phone.trim() || undefined,
        departments: form.departments,
      };
      editing
        ? await api.put(`/employees/${editing}`, payload)
        : await api.post('/employees', payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving employee'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await api.delete(`/employees/${id}`);
    load();
  };

  const filtered = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
          <p className="text-sm text-slate-400 mt-0.5">{employees.length} staff members</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Employee</button>
      </div>

      {/* Search */}
      <input className="input w-full md:w-80 mb-6" placeholder="Search by name…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      {loading ? (
        <p className="text-center text-slate-400 py-20 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No employees found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Employee</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-5">Departments</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((emp, i) => (
            <div key={emp._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>

              {/* Avatar + Name + Email */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-slate-400">{emp.email || '—'}</p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[emp.user?.role] || 'bg-slate-100 text-slate-500'}`}>
                  {emp.user?.role || '—'}
                </span>
              </div>

              {/* Departments */}
              <div className="col-span-5 flex flex-wrap gap-1.5">
                {!emp.departments?.length ? (
                  <span className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full">Unassigned</span>
                ) : emp.departments.map(d => (
                  <span key={d._id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEPT_COLORS[d.name] || 'bg-slate-100 text-slate-600'}`}>
                    {d.name}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex gap-2 justify-end">
                <button onClick={() => openEdit(emp)}
                  className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">Edit</button>
                <button onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
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
                  {editing ? 'Edit Employee' : 'New Employee'}
                </h3>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-3">

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                    {error}
                  </div>
                )}

                {/* Select user — création seulement */}
                {!editing && (
                  <div>
                    <label className="label">Select User *</label>
                    <select className="input" value={form.userId} onChange={handleUserSelect}>
                      <option value="">— Choose a user —</option>
                      {availableUsers.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <p className="text-xs text-amber-500 mt-1.5">All users are already employees</p>
                    )}
                  </div>
                )}

                {/* Auto-filled fields */}
                {(preview.name || editing) && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Auto-filled from Users</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">First Name</label>
                        <input className="input bg-slate-100 cursor-not-allowed" readOnly
                          value={preview.name.split(' ')[0] || ''} />
                      </div>
                      <div>
                        <label className="label">Last Name</label>
                        <input className="input bg-slate-100 cursor-not-allowed" readOnly
                          value={preview.name.split(' ').slice(1).join(' ') || ''} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className="input bg-slate-100 cursor-not-allowed" readOnly
                        value={preview.email} />
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input" placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>

                {/* Departments */}
                <div>
                  <label className="label">Assign to Department(s)</label>
                  <div className="space-y-2 mt-1">
                    {departments.map(dept => {
                      const selected = form.departments.includes(dept._id);
                      return (
                        <label key={dept._id}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer border-2 transition-all ${
                            selected ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                          }`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleDept(dept._id)}
                            className="w-4 h-4 accent-blue-600" />
                          <span className={`text-sm font-medium ${DEPT_COLORS[dept.name]?.split(' ')[1] || 'text-slate-700'}`}>
                            {dept.name}
                          </span>
                          {selected && <span className="ml-auto text-blue-500 text-xs font-semibold">selected</span>}
                        </label>
                      );
                    })}
                  </div>
                  {form.departments.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1.5">No department selected — employee will be unassigned</p>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5">
                  {editing ? 'Update Employee' : 'Create Employee'}
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

