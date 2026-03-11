import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

export default function DoctorNavbar() {
  const { user, logout } = useAuth();
  const { unreadCount }  = useNotif();
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
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base">D</div>
          <div>
            <span className="font-bold text-slate-800 text-base leading-tight block">Apollonia</span>
            <span className="text-xs text-slate-400 leading-tight block">Doctor Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NavLink to="/dashboard"    className={navClass}>Dashboard</NavLink>
          <NavLink to="/patients"     className={navClass}>Patients</NavLink>
          <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
          <NavLink to="/meetings"     className={navClass}>Meetings</NavLink>
          {/* Notifications badge pour le doctor */}
          <NavLink to="/notifications" className={({ isActive }) =>
            `relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/profile" className="text-right hidden sm:block hover:opacity-80 transition">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Doctor</span>
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