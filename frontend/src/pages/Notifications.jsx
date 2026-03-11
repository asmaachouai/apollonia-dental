import { useNotif } from '../context/NotifContext';

const TYPE_COLORS = {
  appointment_cancelled: 'bg-red-50 border-red-200 text-red-700',
  appointment_updated:   'bg-amber-50 border-amber-200 text-amber-700',
  meeting_scheduled:     'bg-blue-50 border-blue-200 text-blue-700',
  general:               'bg-slate-50 border-slate-200 text-slate-700',
};

const TYPE_ICONS = {
  appointment_cancelled: '✕',
  appointment_updated:   '↻',
  meeting_scheduled:     '◷',
  general:               '•',
};

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotif();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-400 mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n._id}
              onClick={() => !n.read && markRead(n._id)}
              className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-sm ${
                n.read
                  ? 'bg-white border-slate-100 opacity-60'
                  : TYPE_COLORS[n.type] || TYPE_COLORS.general
              }`}>

              {/* Unread dot */}
              {!n.read && (
                <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full" />
              )}

              <div className="flex items-start gap-3">
                <span className="text-lg font-bold flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(n.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}