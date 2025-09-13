import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BarChart2, Globe, UploadCloud, FileText, Bell, LogOut, BookOpen, User, Home as HomeIcon, Database, FileBarChart2, FileCheck2, MapPin } from 'lucide-react';

// Dummy user and activity data
const user = {
  name: 'Jane Smith',
  institution: 'National Institute of Environmental Sciences',
  field: 'Environmental Chemistry',
  approvedDatasets: 12,
  pendingDatasets: 3,
};

const quickActions = [
  {
    title: 'Compute Indices',
    icon: BarChart2,
    description: 'Calculate HMPI and other indices.',
    href: '/compute',
    color: 'bg-cyan-600 text-white',
  },
  {
    title: 'Explore Approved Data',
    icon: Globe,
    description: 'Browse and visualize approved datasets.',
    href: '/explore',
    color: 'bg-blue-600 text-white',
  },
  {
    title: 'Submit New Data',
    icon: UploadCloud,
    description: 'Upload new research data for review.',
    href: '/submit',
    color: 'bg-emerald-600 text-white',
  },
  {
    title: 'Generate Reports',
    icon: FileText,
    description: 'Create and download custom reports.',
    href: '/reports',
    color: 'bg-indigo-600 text-white',
  },
];

const activity = [
  { id: 1, title: 'Submitted dataset: Ganga Basin 2024', status: 'Pending', date: '2025-09-10' },
  { id: 2, title: 'Dataset: Yamuna River 2023', status: 'Approved', date: '2025-08-28' },
  { id: 3, title: 'Dataset: Delhi Urban 2022', status: 'Rejected', date: '2025-08-10' },
  { id: 4, title: 'Submitted dataset: UP Groundwater 2025', status: 'Pending', date: '2025-09-01' },
];

const notifications = [
  { id: 1, message: 'Your dataset "Ganga Basin 2024" is under review.', date: '2025-09-10' },
  { id: 2, message: 'System maintenance scheduled for Sep 20.', date: '2025-09-09' },
  { id: 3, message: 'New research highlights available.', date: '2025-09-07' },
];

const globalHighlights = [
  { id: 1, title: 'Amazon River, Brazil', institution: 'INPA', date: '2025-08-30' },
  { id: 2, title: 'Rhine Basin, Germany', institution: 'UFZ', date: '2025-08-25' },
  { id: 3, title: 'Yellow River, China', institution: 'CAS', date: '2025-08-20' },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    // Clear user session (this is just a placeholder, implement actual logout logic)
    console.log('User logged out');
    localStorage.removeItem('user_id');
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
      {/* Header / Navbar */}
      <header className="w-full border-b border-blue-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/cgwb_logo.png" onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.svg'; }} className="h-9 w-9 rounded-full ring-1 ring-black/10 bg-white" alt="CGWB Logo" />
            <span className="font-bold text-lg text-blue-900 tracking-tight">HMPI Portal</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-blue-900 items-center">
            <NavLink icon={HomeIcon} label="Home" href="/" />
            <NavLink icon={Database} label="Explore Data" href="/explore" />
            <NavLink icon={UploadCloud} label="Submit Data" href="/submit" />
            <NavLink icon={FileBarChart2} label="Compute Indices" href="/compute" />
            <NavLink icon={FileCheck2} label="Reports" href="/reports" />
            <NavLink icon={User} label="Profile" href="/profile" />
            <button className="flex items-center gap-1 text-red-600 hover:text-red-700" onClick={handleLogout}><LogOut className="w-4 h-4" />Logout</button>
          </nav>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">
            <span className="block w-6 h-0.5 bg-blue-900 mb-1" />
            <span className="block w-6 h-0.5 bg-blue-900 mb-1" />
            <span className="block w-6 h-0.5 bg-blue-900" />
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-blue-100 px-4 py-2 flex flex-col gap-3">
            <NavLink icon={HomeIcon} label="Home" href="/dashboard" />
            <NavLink icon={Database} label="Explore Data" href="/explore" />
            <NavLink icon={UploadCloud} label="Submit Data" href="/submit" />
            <NavLink icon={FileBarChart2} label="Compute Indices" href="/compute" />
            <NavLink icon={FileCheck2} label="Reports" href="/reports" />
            <NavLink icon={User} label="Profile" href="/profile" />
            <button className="flex items-center gap-1 text-red-600 hover:text-red-700" onClick={() => navigate('/logout')}><LogOut className="w-4 h-4" />Logout</button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Welcome back, Dr. {user.name}</h2>
          <div className="flex flex-wrap gap-4 items-center text-blue-800">
            <span className="inline-flex items-center gap-1"><BookOpen className="w-4 h-4" /> {user.institution}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.field}</span>
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold ml-2"><FileCheck2 className="w-4 h-4" /> {user.approvedDatasets} Approved</span>
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-semibold ml-2"><FileText className="w-4 h-4" /> {user.pendingDatasets} Pending</span>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <a key={action.title} href={action.href} className={`rounded-2xl shadow-lg p-6 flex flex-col items-center gap-3 hover:scale-[1.03] transition cursor-pointer ${action.color}`}> 
                <action.icon className="w-8 h-8 mb-2" />
                <span className="font-semibold text-lg">{action.title}</span>
                <span className="text-sm opacity-80 text-white/90 text-center">{action.description}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Activity & Notifications */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h3>
            <div className="bg-white rounded-xl shadow p-4 divide-y divide-blue-50">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-blue-900">{item.title}</div>
                    <div className="text-xs text-blue-500">{item.date}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'Approved' && '✅ Approved'}
                    {item.status === 'Pending' && '⏳ Pending'}
                    {item.status === 'Rejected' && '❌ Rejected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h3>
            <div className="bg-white rounded-xl shadow p-4 divide-y divide-blue-50">
              {notifications.map((note) => (
                <div key={note.id} className="py-3">
                  <div className="text-blue-900 font-medium">{note.message}</div>
                  <div className="text-xs text-blue-500">{note.date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Research Highlights */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Global Research Highlights</h3>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <ul className="space-y-3">
                {globalHighlights.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-cyan-600" />
                    <div>
                      <div className="font-semibold text-blue-900">{item.title}</div>
                      <div className="text-xs text-blue-500">{item.institution} • {item.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Optionally, add a map preview here in the future */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-blue-100 bg-white/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <a href="/docs" className="hover:underline">Documentation</a>
            <span className="mx-2">|</span>
            <a href="/about" className="hover:underline">About Project</a>
            <span className="mx-2">|</span>
            <a href="/contact" className="hover:underline">Contact Support</a>
          </div>
          <div>© {new Date().getFullYear()} Environmental Analytics Lab</div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-1 hover:text-blue-600 transition">
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}
