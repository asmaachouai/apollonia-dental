import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🦷</div>
            <h1 className="font-display text-2xl font-bold text-slate-800">Create Account</h1>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full Name</label>
              <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></div>
            <div><label className="label">Email</label>
              <input type="email" className="input" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required /></div>
            <div><label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required /></div>
            <div><label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select></div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60">
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Have account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
