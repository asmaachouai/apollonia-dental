import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700', receptionist: 'bg-purple-100 text-purple-700',
};

export default function Profile() {
  const { user, login } = useAuth();
  const [form,    setForm]    = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/profile', payload);
      // Mise à jour du context avec le nouveau token si besoin
      login({ ...user, ...data });
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-8 page-enter">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize mt-1 inline-block ${ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Update Information</h3>

        {error   && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2.5 text-sm">{success}</div>}

        <div>
          <label className="label">Full Name</label>
          <input className="input" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="label">New Password <span className="normal-case font-normal text-slate-400">(leave blank to keep)</span></label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading}
          className="w-full btn-primary py-3 mt-2 disabled:opacity-60">
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}