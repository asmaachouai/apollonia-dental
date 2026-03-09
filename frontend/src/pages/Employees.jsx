import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', departments: [] };

const DEPT_COLORS = {
  'General Dentistry':     'bg-blue-100 text-blue-700',
  'Pediatric Dentistry':   'bg-green-100 text-green-700',
  'Restorative Dentistry': 'bg-amber-100 text-amber-700',
  'Surgery':               'bg-red-100 text-red-700',
  'Orthodontics':          'bg-purple-100 text-purple-700',
};

export default function Employees() {
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editing,     setEditing]     = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([api.get('/employees'), api.get('/departments')]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (emp) => {
    setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email || '',
              departments: emp.departments?.map(d => d._id) || [] });
    setEditing(emp._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const toggleDept = (id) =>
    setForm(prev => ({
      ...prev,
      departments: prev.departments.includes(id)
        ? prev.departments.filter(d => d !== id)
        : [...prev.departments, id]
    }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required'); return;
    }
    try {
      editing ? await api.put(`/employees/${editing}`, form) : await api.post('/employees', form);
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
          <div className="text-5xl mb-3">👥</div>
          <p className="font-medium">No employees found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Employee</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-5">Departments</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((emp, i) => (
            <div key={emp._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</p>
                  <div className={`w-2 h-2 rounded-full mt-0.5 ${emp.isActive ? 'bg-green-400' : 'bg-slate-300'}`} />
                </div>
              </div>
              <div className="col-span-2 text-xs text-slate-400 truncate">{emp.email || '—'}</div>
              <div className="col-span-5 flex flex-wrap gap-1.5">
                {!emp.departments?.length ? (
                  <span className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full">Unassigned</span>
                ) : emp.departments.map(d => (
                  <span key={d._id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEPT_COLORS[d.name] || 'bg-slate-100 text-slate-600'}`}>
                    {d.name}
                  </span>
                ))}
                {emp.departments?.length > 1 && (
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full border border-amber-200">★ multi</span>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editing ? '✏️ Edit Employee' : '➕ New Employee'}
            </h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">First Name *</label>
                <input className="input" placeholder="e.g. John" value={form.firstName}
                  onChange={e => setForm({...form, firstName: e.target.value})} />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input" placeholder="e.g. Dudley" value={form.lastName}
                  onChange={e => setForm({...form, lastName: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="label">Email (optional)</label>
                <input type="email" className="input" placeholder="john@apollonia.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="mb-6">
              <label className="label">Assign to Department(s)</label>
              <div className="space-y-2">
                {departments.map(dept => {
                  const sel = form.departments.includes(dept._id);
                  return (
                    <label key={dept._id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border-2 transition-all ${sel ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                      <input type="checkbox" checked={sel} onChange={() => toggleDept(dept._id)} className="w-4 h-4 accent-blue-600" />
                      <span className={`text-sm font-medium ${DEPT_COLORS[dept.name]?.split(' ')[1] || 'text-slate-700'}`}>{dept.name}</span>
                      {sel && <span className="ml-auto text-blue-500 text-xs font-semibold">✓</span>}
                    </label>
                  );
                })}
              </div>
              {form.departments.length === 0 && (
                <p className="text-xs text-amber-500 mt-2">⚠️ No department selected — employee will be unassigned</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 btn-primary py-3">
                {editing ? 'Update Employee' : 'Create Employee'}
              </button>
              <button onClick={closeModal} className="flex-1 btn-ghost py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

