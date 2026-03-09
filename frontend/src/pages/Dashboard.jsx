import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DEPT_STYLE = {
  'General Dentistry':     { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   grad: 'from-blue-500 to-blue-600' },
  'Pediatric Dentistry':   { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  grad: 'from-green-500 to-green-600' },
  'Restorative Dentistry': { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  grad: 'from-amber-500 to-amber-600' },
  'Surgery':               { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    grad: 'from-red-500 to-red-600' },
  'Orthodontics':          { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', grad: 'from-purple-500 to-purple-600' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/employees'), api.get('/departments')])
      .then(([e, d]) => { setEmployees(e.data); setDepartments(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const unassigned = employees.filter(e => !e.departments?.length);
  const multiDept  = employees.filter(e => e.departments?.length > 1);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1 text-sm">Apollonia Dental Practice — Staff Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Employees',  value: employees.length,  icon: '', color: 'from-blue-500 to-blue-600' },
          { label: 'Departments',      value: departments.length, icon: '', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Multi-Dept Staff', value: multiDept.length,   icon: '', color: 'from-amber-500 to-amber-600' },
          { label: 'Unassigned',       value: unassigned.length,  icon: '', color: 'from-slate-400 to-slate-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-md`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs opacity-80 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Departments breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Departments</h2>
            <Link to="/departments" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {departments.map(dept => {
              const s = DEPT_STYLE[dept.name] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
              return (
                <div key={dept._id} className={`flex items-center justify-between ${s.bg} rounded-xl px-4 py-3`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className={`text-sm font-medium ${s.text}`}>{dept.name}</span>
                  </div>
                  <span className={`text-sm font-bold ${s.text}`}>{dept.employeeCount} staff</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff list */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Staff ({employees.length})</h2>
            <Link to="/employees" className="text-xs text-blue-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {employees.map(emp => (
              <div key={emp._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {emp.firstName} {emp.lastName}
                    {emp.departments?.length > 1 && (
                      <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">multi</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-slate-400 text-right max-w-[120px] truncate">
                  {!emp.departments?.length ? 'Unassigned' : emp.departments[0]?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(unassigned.length > 0 || multiDept.length > 0) && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {unassigned.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Unassigned Staff ({unassigned.length})</p>
              <p className="text-xs text-amber-600">{unassigned.map(e => `${e.firstName} ${e.lastName}`).join(', ')}</p>
            </div>
          )}
          {multiDept.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1"> Multi-Department Staff ({multiDept.length})</p>
              <p className="text-xs text-blue-600">{multiDept.map(e => `${e.firstName} ${e.lastName}`).join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

