import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base">A</div>
          <div>
            <span className="font-bold text-slate-800 text-base leading-tight block">Apollonia</span>
            <span className="text-xs text-slate-400 leading-tight block">Admin Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NavLink to="/dashboard"   className={navClass}>Dashboard</NavLink>
          <NavLink to="/users"       className={navClass}>Users</NavLink>
          <NavLink to="/employees"   className={navClass}>Employees</NavLink>
          <NavLink to="/departments" className={navClass}>Departments</NavLink>
          <NavLink to="/meetings"    className={navClass}>Meetings</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/profile" className="text-right hidden sm:block hover:opacity-80 transition">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Admin</span>
          </NavLink>
          <button onClick={handleLogout}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition-all">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}