import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';
import api from '../api/axios';

/* ── Helpers ────────────────────────────────────────────── */
const Loader = () => (
  <div className="max-w-6xl mx-auto px-6 py-20 text-center text-slate-400 text-sm">Loading…</div>
);

const Greeting = ({ user, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-slate-800">Welcome, {user?.name?.split(' ')[0]}</h1>
    <p className="text-slate-500 mt-1 text-sm">Apollonia Dental Practice — {subtitle}</p>
  </div>
);

const KPI = ({ label, value, color, link }) => {
  const inner = (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all cursor-pointer`}>
      <div className="text-3xl font-bold">{value ?? '—'}</div>
      <div className="text-xs opacity-80 mt-1 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
};

const SectionTitle = ({ children }) => (
  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{children}</h3>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>{children}</div>
);

const Empty = ({ text }) => (
  <p className="text-center text-slate-400 text-sm py-6">{text}</p>
);

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-slate-100 text-slate-500',
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700', receptionist: 'bg-purple-100 text-purple-700',
};

const DEPT_COLORS = {
  'General Dentistry':     'bg-blue-100 text-blue-700',
  'Pediatric Dentistry':   'bg-green-100 text-green-700',
  'Restorative Dentistry': 'bg-amber-100 text-amber-700',
  'Surgery':               'bg-red-100 text-red-700',
  'Orthodontics':          'bg-purple-100 text-purple-700',
};

/* ══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════ */
function AdminDashboard({ user }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/departments'),
      api.get('/auth/users'),
      api.get('/meetings'),
      api.get('/appointments'),
    ]).then(([e, d, u, m, a]) => setData({
      employees:    e.data,
      departments:  d.data,
      users:        u.data,
      meetings:     m.data,
      appointments: a.data,
    })).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loader />;

  const today       = new Date().toISOString().slice(0,10);
  const unassigned  = data.employees.filter(e => !e.departments?.length);
  const multiDept   = data.employees.filter(e => e.departments?.length > 1);
  const upcomingMtg = data.meetings.filter(m => new Date(m.date) >= new Date()).slice(0,5);
  const todayAppts  = data.appointments.filter(a => a.date?.slice(0,10) === today);

  const roleCount = data.users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1; return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <Greeting user={user} subtitle="Admin Panel" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPI label="Employees"   value={data.employees.length}   color="from-blue-500 to-blue-700"   link="/employees" />
        <KPI label="Departments" value={data.departments.length} color="from-slate-500 to-slate-700" link="/departments" />
        <KPI label="Users"       value={data.users.length}       color="from-red-500 to-red-700"     link="/users" />
        <KPI label="Today's Appts" value={todayAppts.length}     color="from-green-500 to-green-700" link="/appointments" />
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Users by role */}
        <div className="col-span-12 md:col-span-4">
          <SectionTitle>Users by Role</SectionTitle>
          <Card>
            <div className="space-y-3">
              {Object.entries(roleCount).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600'}`}>{role}</span>
                  <span className="font-bold text-slate-700 text-sm">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Departments + employee count */}
        <div className="col-span-12 md:col-span-4">
          <SectionTitle>Departments</SectionTitle>
          <Card>
            <div className="space-y-3">
              {data.departments.map(d => (
                <div key={d._id} className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEPT_COLORS[d.name] || 'bg-slate-100 text-slate-600'}`}>{d.name}</span>
                  <span className="font-bold text-slate-700 text-sm">{d.employeeCount} emp.</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="col-span-12 md:col-span-4">
          <SectionTitle>Alerts</SectionTitle>
          <Card>
            <div className="space-y-3">
              {unassigned.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">{unassigned.length} unassigned employee(s)</p>
                  <p className="text-xs text-amber-600 mt-0.5">{unassigned.map(e => `${e.firstName} ${e.lastName}`).join(', ')}</p>
                </div>
              )}
              {multiDept.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700">{multiDept.length} multi-dept employee(s)</p>
                  <p className="text-xs text-blue-600 mt-0.5">{multiDept.map(e => `${e.firstName} ${e.lastName}`).join(', ')}</p>
                </div>
              )}
              {unassigned.length === 0 && multiDept.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No alerts</p>
              )}
            </div>
          </Card>
        </div>

        {/* Upcoming meetings */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>Upcoming Meetings</SectionTitle>
          <Card>
            {upcomingMtg.length === 0 ? <Empty text="No upcoming meetings" /> : (
              <div className="space-y-3">
                {upcomingMtg.map(m => (
                  <div key={m._id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex-shrink-0 flex flex-col items-center justify-center text-blue-700">
                      <span className="text-xs font-bold">{new Date(m.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-400">{m.time} · {m.duration}min · {m.participants?.length} participant(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Today appointments */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>Today's Appointments</SectionTitle>
          <Card>
            {todayAppts.length === 0 ? <Empty text="No appointments today" /> : (
              <div className="space-y-3">
                {todayAppts.map(a => (
                  <div key={a._id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-10 text-center flex-shrink-0">
                      <p className="text-xs font-bold text-slate-700">{a.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
                      <p className="text-xs text-slate-400">{a.reason || '—'} · Dr. {a.doctor?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DOCTOR DASHBOARD
══════════════════════════════════════════════════════════ */
function DoctorDashboard({ user }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/patients'),
      api.get('/appointments'),
      api.get('/meetings'),
    ]).then(([p, a, m]) => setData({
      patients:     p.data,
      appointments: a.data,
      meetings:     m.data,
    })).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loader />;

  const today       = new Date().toISOString().slice(0,10);
  const todayAppts  = data.appointments.filter(a => a.date?.slice(0,10) === today);
  const upcoming    = data.appointments.filter(a => a.date?.slice(0,10) > today && a.status === 'scheduled').slice(0,5);
  const upcomingMtg = data.meetings.filter(m => new Date(m.date) >= new Date()).slice(0,3);
  const completed   = data.appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <Greeting user={user} subtitle="Doctor Portal" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPI label="My Patients"     value={data.patients.length}     color="from-blue-500 to-blue-700"   link="/patients" />
        <KPI label="Today"           value={todayAppts.length}        color="from-green-500 to-green-700" link="/appointments" />
        <KPI label="Upcoming"        value={upcoming.length}          color="from-amber-500 to-amber-600" link="/appointments" />
        <KPI label="Completed"       value={completed}                color="from-slate-500 to-slate-700" link="/appointments" />
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Today's schedule */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>Today's Schedule</SectionTitle>
          <Card>
            {todayAppts.length === 0 ? <Empty text="No appointments today" /> : (
              <div className="space-y-3">
                {todayAppts.map(a => (
                  <div key={a._id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 text-center flex-shrink-0 bg-blue-50 rounded-xl py-2">
                      <p className="text-xs font-bold text-blue-700">{a.time}</p>
                      <p className="text-xs text-blue-400">{a.duration}m</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
                      <p className="text-xs text-slate-400">{a.reason || '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize flex-shrink-0 ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming appointments */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>Upcoming Appointments</SectionTitle>
          <Card>
            {upcoming.length === 0 ? <Empty text="No upcoming appointments" /> : (
              <div className="space-y-3">
                {upcoming.map(a => (
                  <div key={a._id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 text-center flex-shrink-0 bg-slate-50 rounded-xl py-2">
                      <p className="text-xs font-bold text-slate-700">{new Date(a.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
                      <p className="text-xs text-slate-400">{a.reason || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* My meetings */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>My Upcoming Meetings</SectionTitle>
          <Card>
            {upcomingMtg.length === 0 ? <Empty text="No upcoming meetings" /> : (
              <div className="space-y-3">
                {upcomingMtg.map(m => (
                  <div key={m._id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 text-center flex-shrink-0 bg-blue-50 rounded-xl py-2">
                      <p className="text-xs font-bold text-blue-700">{new Date(m.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</p>
                      <p className="text-xs text-blue-400">{m.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{m.title}</p>
                      <p className="text-xs text-slate-400">{m.duration}min{m.location ? ` · ${m.location}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent patients */}
        <div className="col-span-12 md:col-span-6">
          <SectionTitle>Recent Patients</SectionTitle>
          <Card>
            {data.patients.length === 0 ? <Empty text="No patients yet" /> : (
              <div className="space-y-3">
                {data.patients.slice(0, 5).map(p => (
                  <div key={p._id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-400">{p.phone || p.email || '—'}</p>
                    </div>
                    {p.bloodType && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{p.bloodType}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RECEPTIONIST DASHBOARD
══════════════════════════════════════════════════════════ */
function ReceptionistDashboard({ user }) {
  const { notifications, unreadCount } = useNotif();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loader />;

  const today     = new Date().toISOString().slice(0,10);
  const todayAll  = data.filter(a => a.date?.slice(0,10) === today);
  const scheduled = todayAll.filter(a => a.status === 'scheduled');
  const completed = todayAll.filter(a => a.status === 'completed');
  const cancelled = todayAll.filter(a => a.status === 'cancelled');
  const upcoming  = data.filter(a => a.date?.slice(0,10) > today && a.status === 'scheduled').slice(0, 8);
  const recentNotifs = notifications.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <Greeting user={user} subtitle="Reception Desk" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPI label="Today Total"    value={todayAll.length}   color="from-slate-500 to-slate-700"   link="/appointments" />
        <KPI label="Scheduled"      value={scheduled.length}  color="from-blue-500 to-blue-700"     link="/appointments" />
        <KPI label="Completed"      value={completed.length}  color="from-green-500 to-green-700"   link="/appointments" />
        <KPI label="Notifications"  value={unreadCount}       color="from-red-500 to-red-700"       link="/notifications" />
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Today's appointments */}
        <div className="col-span-12 md:col-span-7">
          <SectionTitle>Today's Appointments</SectionTitle>
          <Card>
            {todayAll.length === 0 ? <Empty text="No appointments today" /> : (
              <div className="space-y-3">
                {todayAll.map(a => (
                  <div key={a._id} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 text-center flex-shrink-0 bg-slate-50 rounded-xl py-2">
                      <p className="text-xs font-bold text-slate-700">{a.time}</p>
                      <p className="text-xs text-slate-400">{a.duration}m</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{a.patient?.firstName} {a.patient?.lastName}</p>
                      <p className="text-xs text-slate-400">Dr. {a.doctor?.name} · {a.reason || '—'}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${STATUS_COLORS[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="col-span-12 md:col-span-5 space-y-6">

          {/* Today summary */}
          <div>
            <SectionTitle>Today Summary</SectionTitle>
            <Card>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 rounded-xl py-3">
                  <p className="text-2xl font-bold text-blue-700">{scheduled.length}</p>
                  <p className="text-xs text-blue-500 mt-1">Scheduled</p>
                </div>
                <div className="bg-green-50 rounded-xl py-3">
                  <p className="text-2xl font-bold text-green-700">{completed.length}</p>
                  <p className="text-xs text-green-500 mt-1">Completed</p>
                </div>
                <div className="bg-red-50 rounded-xl py-3">
                  <p className="text-2xl font-bold text-red-700">{cancelled.length}</p>
                  <p className="text-xs text-red-500 mt-1">Cancelled</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Recent Notifications</SectionTitle>
              {unreadCount > 0 && (
                <Link to="/notifications" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View all ({unreadCount} new)
                </Link>
              )}
            </div>
            <Card>
              {recentNotifs.length === 0 ? <Empty text="No notifications" /> : (
                <div className="space-y-3">
                  {recentNotifs.map(n => (
                    <div key={n._id} className={`rounded-xl px-3 py-2.5 border text-xs ${n.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      <p className="font-semibold">{n.title}</p>
                      <p className="mt-0.5 leading-relaxed opacity-80">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* Upcoming appointments */}
        <div className="col-span-12">
          <SectionTitle>Upcoming Appointments</SectionTitle>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {upcoming.length === 0 ? <Empty text="No upcoming appointments" /> : (
              <>
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-2">Date & Time</div>
                  <div className="col-span-3">Doctor</div>
                  <div className="col-span-3">Reason</div>
                  <div className="col-span-1">Status</div>
                </div>
                {upcoming.map((a, i) => (
                  <div key={a._id} className={`grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-slate-50 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <div className="col-span-3 font-semibold text-slate-800">{a.patient?.firstName} {a.patient?.lastName}</div>
                    <div className="col-span-2 text-slate-600">
                      <p>{new Date(a.date).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-slate-400">{a.time}</p>
                    </div>
                    <div className="col-span-3 text-slate-600 text-xs">Dr. {a.doctor?.name}</div>
                    <div className="col-span-3 text-slate-500 text-xs truncate">{a.reason || '—'}</div>
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin')        return <AdminDashboard user={user} />;
  if (user?.role === 'doctor')       return <DoctorDashboard user={user} />;
  if (user?.role === 'receptionist') return <ReceptionistDashboard user={user} />;
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Greeting user={user} subtitle="Staff Portal" />
      <p className="text-slate-400 text-sm">Your dashboard is being configured.</p>
    </div>
  );
}

