import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGE = {
  admin:       'bg-red-100 text-red-700',
  doctor:      'bg-blue-100 text-blue-700',
  staff:       'bg-green-100 text-green-700',
  receptionist:'bg-purple-100 text-purple-700',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">🦷</div>
          <div>
            <span className="font-display font-bold text-slate-800 text-base leading-tight block">Apollonia</span>
            <span className="text-xs text-slate-400 leading-tight block">Dental Practice</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard"   className={navClass}>Dashboard</NavLink>
          <NavLink to="/employees"   className={navClass}>Employees</NavLink>
          <NavLink to="/departments" className={navClass}>Departments</NavLink>
          {/* Users link — admin only */}
          {user?.role === 'admin' && (
            <NavLink to="/users" className={navClass}>Users</NavLink>
          )}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[user?.role] || 'bg-slate-100 text-slate-600'}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition-all">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}