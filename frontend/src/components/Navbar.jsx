import AdminNavbar       from './AdminNavbar';
import DoctorNavbar      from './DoctorNavbar';
import ReceptionistNavbar from './ReceptionistNavbar';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  if (user?.role === 'admin')        return <AdminNavbar />;
  if (user?.role === 'doctor')       return <DoctorNavbar />;
  if (user?.role === 'receptionist') return <ReceptionistNavbar />;
  return null;
}