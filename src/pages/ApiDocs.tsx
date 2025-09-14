import { Code, GitBranch, Terminal, BookOpen, Home as HomeIcon, Database, UploadCloud, FileBarChart2, FileCheck2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NavLink({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-1 hover:text-blue-600 transition">
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}

export default function ApiDocs() {
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('user_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
      <header className="w-full border-b border-blue-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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
            {localStorage.getItem('user_id') &&
              <button className="flex items-center gap-1 text-red-600 hover:text-red-700" onClick={handleLogout}><LogOut className="w-4 h-4" />Logout</button>
            }
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Terminal className="w-10 h-10 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">API Documentation</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <GitBranch className="w-4 h-4" />
              <span>version 1.0</span>
            </p>
          </div>
        </div>

        {/* Endpoint 1: Health Check */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Code className="w-5 h-5" />
            GET /api/health
          </h2>
          <p className="text-slate-600 mb-4">
            Returns the health status of the API and basic data load info.
          </p>
          <h3 className="font-semibold text-slate-600 mb-2">Sample Response:</h3>
          <pre className="bg-slate-800 text-white p-4 rounded-lg text-sm">
            <code>
{`{
  "status": "ok",
  "loaded": true,
  "rows": 1234
}`}
            </code>
          </pre>
        </section>

        {/* Endpoint 2: States List */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Code className="w-5 h-5" />
            GET /api/states
          </h2>
          <p className="text-slate-600 mb-4">
            Returns a list of all unique states present in the heavy metals data CSV.
          </p>
          <h3 className="font-semibold text-slate-600 mb-2">Sample Response:</h3>
          <pre className="bg-slate-800 text-white p-4 rounded-lg text-sm">
            <code>
{`[
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar"
  // ...more states
]`}
            </code>
          </pre>
        </section>

        {/* Endpoint 3: Data by State */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Code className="w-5 h-5" />
            GET /api/data?state=NAME
          </h2>
          <p className="text-slate-600 mb-4">
            Returns all data rows for a given state. Replace NAME with the exact state name (case-insensitive).
          </p>
          <h3 className="font-semibold text-slate-600 mb-2">Sample Request Example:</h3>
          <pre className="bg-slate-800 text-white p-4 rounded-lg text-sm">
            <code>GET /api/data?state=Gujarat</code>
          </pre>
          <h3 className="font-semibold text-slate-600 mt-4 mb-2">Sample Response:</h3>
          <pre className="bg-slate-800 text-white p-4 rounded-lg text-sm">
            <code>
{`{
  "state": "Gujarat",
  "count": 2,
  "rows": [
    {
      "State": "Gujarat",
      "District": "Ahmedabad",
      "Location": "Sabarmati River",
      "Longitude": "72.5714",
      "Latitude": "23.0225",
      "Cd": "0.01",
      "Cr": "0.02",
      "Cu": "0.03",
      "Pb": "0.04",
      "Mn": "0.05",
      "Ni": "0.06",
      "Fe": "0.07",
      "Zn": "0.08"
    },
    {
      "State": "Gujarat",
      "District": "Surat",
      "Location": "Tapti River",
      "Longitude": "72.8311",
      "Latitude": "21.1702",
      "Cd": "0.02",
      "Cr": "0.03",
      "Cu": "0.04",
      "Pb": "0.05",
      "Mn": "0.06",
      "Ni": "0.07",
      "Fe": "0.08",
      "Zn": "0.09"
    }
    // ...more rows if available
  ]
}`}
            </code>
          </pre>
        </section>
      </main>

      <footer className="w-full border-t border-blue-100 bg-white/80 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-700">
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
