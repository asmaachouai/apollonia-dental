import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { name: '', description: '', color: '#2563EB' };

const DEPT_STYLE = {
  'General Dentistry':     'bg-blue-50 border-blue-200 text-blue-800',
  'Pediatric Dentistry':   'bg-green-50 border-green-200 text-green-800',
  'Restorative Dentistry': 'bg-amber-50 border-amber-200 text-amber-800',
  'Surgery':               'bg-red-50 border-red-200 text-red-800',
  'Orthodontics':          'bg-purple-50 border-purple-200 text-purple-800',
};

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editing,     setEditing]     = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/departments'); setDepartments(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setError(''); setShowModal(true); };
  const openEdit   = (dept) => {
    setForm({ name: dept.name, description: dept.description || '', color: dept.color || '#2563EB' });
    setEditing(dept._id); setError(''); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Department name is required'); return; }
    try {
      editing ? await api.put(`/departments/${editing}`, form) : await api.post('/departments', form);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving department'); }
  };

  const handleDelete = async (id, name, count) => {
    if (count > 0) { alert(`Cannot delete "${name}" — ${count} employee(s) assigned. Reassign them first.`); return; }
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try { await api.delete(`/departments/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting department'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-400 mt-0.5">{departments.length} departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Department</button>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-20 text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(dept => {
            const style = DEPT_STYLE[dept.name] || 'bg-slate-50 border-slate-200 text-slate-800';
            return (
              <div key={dept._id} className={`rounded-2xl border-2 p-5 ${style} transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                    <h3 className="font-bold text-base">{dept.name}</h3>
                  </div>
                  <span className="text-2xl font-bold opacity-60">{dept.employeeCount}</span>
                </div>
                <p className="text-xs opacity-70 mb-4 leading-relaxed min-h-[32px]">
                  {dept.description || 'No description'}
                </p>
                <div className="text-xs opacity-60 mb-4">
                  {dept.employeeCount} {dept.employeeCount === 1 ? 'employee' : 'employees'} assigned
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(dept)}
                    className="flex-1 bg-white/60 hover:bg-white text-current py-2 rounded-xl text-xs font-semibold border border-current/20 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(dept._id, dept.name, dept.employeeCount)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-xs font-semibold transition">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editing ? '✏️ Edit Department' : '➕ New Department'}
            </h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
            <div className="space-y-4 mb-6">
              <div>
                <label className="label">Department Name *</label>
                <input className="input" placeholder="e.g. Orthodontics" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What does this department do?"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                    value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                  <span className="text-sm text-slate-500">{form.color}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 btn-primary py-3">
                {editing ? 'Update' : 'Create Department'}
              </button>
              <button onClick={closeModal} className="flex-1 btn-ghost py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
