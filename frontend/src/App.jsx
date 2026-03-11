import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import Navbar        from './components/Navbar';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Employees     from './pages/Employees';
import Departments   from './pages/Departments';
import Users         from './pages/Users';
import Patients      from './pages/Patients';
import Appointments  from './pages/Appointments';
import Meetings      from './pages/Meetings';
import Profile       from './pages/Profile';
import Notifications from './pages/Notifications';

function PrivateLayout({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Tous rôles */}
      <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/profile"   element={<PrivateLayout><Profile /></PrivateLayout>} />

      {/* Doctor + Receptionist — notifications */}
      <Route path="/notifications" element={<PrivateLayout roles={['doctor','receptionist']}><Notifications /></PrivateLayout>} />

      {/* Admin only */}
      <Route path="/users"       element={<PrivateLayout roles={['admin']}><Users /></PrivateLayout>} />
      <Route path="/employees"   element={<PrivateLayout roles={['admin']}><Employees /></PrivateLayout>} />
      <Route path="/departments" element={<PrivateLayout roles={['admin']}><Departments /></PrivateLayout>} />

      {/* Admin + Doctor + Receptionist — patients (permissions gérées côté UI et API) */}
      <Route path="/patients" element={<PrivateLayout roles={['admin','doctor','receptionist']}><Patients /></PrivateLayout>} />

      {/* Admin + Doctor — meetings */}
      <Route path="/meetings" element={<PrivateLayout roles={['admin','doctor']}><Meetings /></PrivateLayout>} />

      {/* Admin + Doctor + Receptionist — appointments */}
      <Route path="/appointments" element={<PrivateLayout roles={['admin','doctor','receptionist']}><Appointments /></PrivateLayout>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotifProvider>
    </AuthProvider>
  );
}
