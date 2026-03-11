import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Employees   from './pages/Employees';
import Departments from './pages/Departments';
import Users       from './pages/Users';

function PrivateLayout({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — login only */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/dashboard"   element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/employees"   element={<PrivateLayout><Employees /></PrivateLayout>} />
          <Route path="/departments" element={<PrivateLayout><Departments /></PrivateLayout>} />

          {/* Admin only */}
          <Route path="/users" element={<PrivateLayout adminOnly><Users /></PrivateLayout>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

