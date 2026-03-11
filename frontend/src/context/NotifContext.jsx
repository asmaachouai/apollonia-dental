import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotifContext = createContext();
export const useNotif = () => useContext(NotifContext);

export function NotifProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch { /* silently fail */ }
  }, [user]);

  useEffect(() => {
    load();
    // Poll toutes les 30 secondes
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read/all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, load, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
}