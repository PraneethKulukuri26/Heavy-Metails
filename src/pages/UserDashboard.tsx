import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BarChart2, Globe, UploadCloud, FileText, Bell, LogOut, BookOpen, User, Home as HomeIcon, Database, FileBarChart2, FileCheck2, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Dummy user and activity data
// const user = {
//   name: 'Jane Smith',
//   institution: 'National Institute of Environmental Sciences',
//   field: 'Environmental Chemistry',
//   approvedDatasets: 12,
//   pendingDatasets: 3,
// };

const quickActions = [
  {
    title: 'Compute Indices',
    icon: BarChart2,
    description: 'Calculate HMPI and other indices.',
    href: '/hmpi',
    color: 'bg-cyan-600 text-white'
  },
  {
    title: 'Explore Approved Data',
    icon: Globe,
    description: 'Browse and visualize approved datasets.',
    href: '/explore',
    color: 'bg-blue-600 text-white'
  },
  {
    title: 'Submit New Data',
    icon: UploadCloud,
    description: 'Upload new research data for review.',
    href: '/submit',
    color: 'bg-emerald-600 text-white'
  },
  {
    title: 'Generate Reports',
    icon: FileText,
    description: 'Create and download custom reports.',
    href: '/reports',
    color: 'bg-indigo-600 text-white'
  }
];


type Report = {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  path: string;
  status: string;
  message: string;
  submitted_at: string;
  updated_at: string;
};

type UserProfile = {
  name: string;
  institution: string;
  field: string;
};


const notifications = [
  { id: 1, message: 'Your dataset "Ganga Basin 2024" is under review.', date: '2025-09-10' },
  { id: 2, message: 'System maintenance scheduled for Sep 20.', date: '2025-09-09' },
  { id: 3, message: 'New research highlights available.', date: '2025-09-07' },
];


type Highlight = {
  id: string;
  title: string;
  institution: string;
  date: string;
  url?: string;
};


export default function UserDashboard() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [globalHighlights, setGlobalHighlights] = useState<Highlight[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [errorHighlights, setErrorHighlights] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch global research highlights from a real API
  useEffect(() => {
    setLoadingHighlights(true);
    setErrorHighlights(null);
    fetch('https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=OPEN_ACCESS:Y%20AND%20REVIEW:Y&format=json&pageSize=5')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        if (data.resultList && data.resultList.result) {
          setGlobalHighlights(
            data.resultList.result.map((item: any, idx: number) => ({
              id: item.id || idx.toString(),
              title: item.title,
              institution: item.authorString || 'Unknown',
              date: item.firstPublicationDate || item.pubYear || '',
              url: item.fullTextUrlList && item.fullTextUrlList.fullTextUrl && item.fullTextUrlList.fullTextUrl[0]?.url,
            }))
          );
        } else {
          setGlobalHighlights([]);
        }
      })
      .catch(() => setErrorHighlights('Failed to load research highlights.'))
      .finally(() => setLoadingHighlights(false));
  }, []);

  // Fetch user profile from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setLoadingProfile(false);
        navigate('/auth'); // Redirect to login if no user ID
        return;
      }

      try {
        const { data, error } = await supabase
          .from('researchers')
          .select('name, institution, field')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch recent activity reports for this user
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    setLoadingReports(true);
    fetch(`http://localhost:3000/api/user/${userId}/recent-reports`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => setRecentReports(data.reports || []))
      .catch(() => setRecentReports([]))
      .finally(() => setLoadingReports(false));
  }, []);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    // Clear user session (this is just a placeholder, implement actual logout logic)
    console.log('User logged out');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  function handleOpenUpload(e?: React.MouseEvent) {
    e?.preventDefault();
    setShowUpload(true);
    setCsvFile(null);
    setUploadStatus(null);
    setTitle('');
    setMessage('');
  }

  function handleCloseUpload() {
    setShowUpload(false);
    setCsvFile(null);
    setUploadStatus(null);
    setTitle('');
    setMessage('');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUploadStatus(null);
    }
  }

  async function handleUpload() {
    if (!csvFile) return;
    setUploadStatus('Uploading...');
    try {
      const formData = new FormData();
      const userId = localStorage.getItem('user_id') || '';
      formData.append('user_id', userId);
      formData.append('title', title || csvFile.name.replace(/\.csv$/i, ''));
      formData.append('message', message);
      formData.append('file', csvFile);
      const res = await fetch('http://localhost:3000/api/report', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setUploadStatus('Upload successful! Report ID: ' + data.id);
    } catch (err: any) {
      setUploadStatus('Upload failed: ' + (err?.message || 'Unknown error'));
    }
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
            <NavLink icon={FileBarChart2} label="Compute Indices" href="/hmpi" />
            <NavLink icon={FileCheck2} label="Reports" href="/reports" />
            {/* <NavLink icon={User} label="Profile" href="/profile" /> */}
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
            <NavLink icon={FileBarChart2} label="Compute Indices" href="/hmpi" />
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
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
            {loadingProfile ? 'Loading...' : `Welcome back, Dr. ${userProfile?.name || 'User'}`}
          </h2>
          {!loadingProfile && userProfile && (
            <div className="flex flex-wrap gap-4 items-center text-blue-800">
              <span className="inline-flex items-center gap-1"><BookOpen className="w-4 h-4" /> {userProfile.institution}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {userProfile.field}</span>
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold ml-2"><FileCheck2 className="w-4 h-4" /> {recentReports.filter(r => r.status === 'approved').length} Approved</span>
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-semibold ml-2"><FileText className="w-4 h-4" /> {recentReports.filter(r => r.status === 'pending').length} Pending</span>
            </div>
          )}
        </section>

        {/* Quick Actions Section */}
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              action.title === 'Submit New Data' ? (
                <button
                  key={action.title}
                  className={`rounded-2xl shadow-lg p-6 flex flex-col items-center gap-3 hover:scale-[1.03] transition cursor-pointer ${action.color}`}
                  onClick={handleOpenUpload}
                >
                  <action.icon className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-lg">{action.title}</span>
                  <span className="text-sm opacity-80 text-white/90 text-center">{action.description}</span>
                </button>
              ) : (
                <a key={action.title} href={action.href} className={`rounded-2xl shadow-lg p-6 flex flex-col items-center gap-3 hover:scale-[1.03] transition cursor-pointer ${action.color}`}> 
                  <action.icon className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-lg">{action.title}</span>
                  <span className="text-sm opacity-80 text-white/90 text-center">{action.description}</span>
                </a>
              )
            ))}
          </div>

          {/* Upload Dialog placeholder, moved to end of component */}
        </section>

        {/* Activity & Notifications */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h3>
            <div className="bg-white rounded-xl shadow p-4 divide-y divide-blue-50 min-h-[120px]">
              {loadingReports ? (
                <div className="text-blue-700 text-center py-6">Loading...</div>
              ) : recentReports.length === 0 ? (
                <div className="text-slate-500 text-center py-6">No recent reports found.</div>
              ) : recentReports.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-blue-900">{item.title}</div>
                    <div className="text-xs text-blue-500">{new Date(item.submitted_at).toLocaleString()}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status === 'approved' && '✅ Approved'}
                    {item.status === 'pending' && '⏳ Pending'}
                    {item.status === 'rejected' && '❌ Rejected'}
                    {item.status !== 'approved' && item.status !== 'pending' && item.status !== 'rejected' && item.status}
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
              {loadingHighlights ? (
                <div className="text-blue-700 text-center py-6">Loading highlights...</div>
              ) : errorHighlights ? (
                <div className="text-red-600 text-center py-6">{errorHighlights}</div>
              ) : globalHighlights.length === 0 ? (
                <div className="text-slate-500 text-center py-6">No research highlights found.</div>
              ) : (
                <ul className="space-y-3">
                  {globalHighlights.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <Globe className="w-6 h-6 text-cyan-600" />
                      <div>
                        <div className="font-semibold text-blue-900">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {item.title}
                            </a>
                          ) : item.title}
                        </div>
                        <div className="text-xs text-blue-500">{item.institution} • {item.date}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Optionally, add a map preview here in the future */}
          </div>
        </section>

        {/* Upload Dialog (moved here for correct block structure) */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={handleCloseUpload} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h4 className="text-xl font-bold mb-2 text-blue-900">Submit New Data (CSV)</h4>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpload(); }}>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Report Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Message (optional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Add a message for reviewers (optional)"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="mb-2"
                    required
                  />
                  {csvFile && <div className="mb-2 text-sm text-blue-800">Selected: {csvFile.name}</div>}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-800 transition-colors disabled:opacity-60"
                  disabled={!csvFile || uploadStatus === 'Uploading...'}
                >
                  {uploadStatus === 'Uploading...' ? 'Uploading...' : 'Upload'}
                </button>
                {uploadStatus && <div className={`mt-3 text-center text-sm ${uploadStatus.includes('success') ? 'text-green-700' : uploadStatus.includes('failed') ? 'text-red-700' : 'text-blue-700'}`}>{uploadStatus}</div>}
              </form>
            </div>
          </div>
        )}
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
