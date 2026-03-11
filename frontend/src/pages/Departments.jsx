import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { name: '', description: '', color: '#2563EB' };

const DEPT_STYLE = {
  'General Dentistry':     { card: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: '#2563EB' },
  'Pediatric Dentistry':   { card: 'bg-green-50 border-green-200',  badge: 'bg-green-100 text-green-700',  dot: '#16A34A' },
  'Restorative Dentistry': { card: 'bg-amber-50 border-amber-200',  badge: 'bg-amber-100 text-amber-700',  dot: '#D97706' },
  'Surgery':               { card: 'bg-red-50 border-red-200',      badge: 'bg-red-100 text-red-700',      dot: '#DC2626' },
  'Orthodontics':          { card: 'bg-purple-50 border-purple-200',badge: 'bg-purple-100 text-purple-700',dot: '#7C3AED' },
};

const DEFAULT_STYLE = { card: 'bg-slate-50 border-slate-200', badge: 'bg-slate-100 text-slate-600', dot: '#64748b' };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [expanded,    setExpanded]    = useState(null); // dept _id expanded
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editing,     setEditing]     = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Employees par département
  const getEmpsByDept = (deptId) =>
    employees.filter(emp =>
      emp.departments?.some(d => d._id === deptId || d === deptId)
    );

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (dept) => {
    setForm({ name: dept.name, description: dept.description || '', color: dept.color || '#2563EB' });
    setEditing(dept._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Department name is required'); return; }
    try {
      editing
        ? await api.put(`/departments/${editing}`, form)
        : await api.post('/departments', form);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving department'); }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete "${name}" — ${count} employee(s) assigned. Reassign them first.`);
      return;
    }
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try { await api.delete(`/departments/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting department'); }
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const ROLE_COLORS = {
    admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700',
    staff: 'bg-green-100 text-green-700', receptionist: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-400 mt-0.5">{departments.length} departments · {employees.length} employees</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Department</button>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-20 text-sm">Loading…</p>
      ) : (
        <div className="space-y-4">
          {departments.map(dept => {
            const style   = DEPT_STYLE[dept.name] || DEFAULT_STYLE;
            const emps    = getEmpsByDept(dept._id);
            const isOpen  = expanded === dept._id;

            return (
              <div key={dept._id} className={`rounded-2xl border-2 overflow-hidden transition-all ${style.card}`}>

                {/* Department row */}
                <div className="flex items-center gap-4 px-5 py-4">

                  {/* Color dot + name */}
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color || style.dot }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base">{dept.name}</h3>
                    {dept.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{dept.description}</p>
                    )}
                  </div>

                  {/* Employee count badge */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.badge}`}>
                    {emps.length} {emps.length === 1 ? 'employee' : 'employees'}
                  </span>

                  {/* Expand toggle */}
                  <button onClick={() => toggleExpand(dept._id)}
                    className="text-slate-400 hover:text-slate-700 transition px-2 text-lg font-bold select-none">
                    {isOpen ? '▲' : '▼'}
                  </button>

                  {/* Actions */}
                  <button onClick={() => openEdit(dept)}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(dept._id, dept.name, emps.length)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                    Delete
                  </button>
                </div>

                {/* Employees list — expandable */}
                {isOpen && (
                  <div className="border-t border-current/10 bg-white/60">
                    {emps.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-6">No employees assigned to this department</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {emps.map(emp => (
                          <div key={emp._id} className="flex items-center gap-3 px-6 py-3 hover:bg-white/80 transition">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            {/* Name + email */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-slate-400 truncate">{emp.email || '—'}</p>
                            </div>
                            {/* Role */}
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[emp.user?.role] || 'bg-slate-100 text-slate-500'}`}>
                              {emp.user?.role || '—'}
                            </span>
                            {/* Multi-dept badge */}
                            {emp.departments?.length > 1 && (
                              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full border border-amber-200">
                                +{emp.departments.length - 1} dept
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">

              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  {editing ? 'Edit Department' : 'New Department'}
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>
                )}
                <div>
                  <label className="label">Department Name *</label>
                  <input className="input" placeholder="e.g. Orthodontics" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={3} placeholder="What does this department do?"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="label">Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                      value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                    <span className="text-sm text-slate-500">{form.color}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex gap-3">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5">
                  {editing ? 'Update Department' : 'Create Department'}
                </button>
                <button onClick={closeModal} className="flex-1 btn-ghost py-2.5">Cancel</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}