import { useEffect, useState } from 'react';
import { Globe, FileText, Search, Loader2 } from 'lucide-react';

interface Report {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  path: string;
  status: string;
  message: string;
  submitted_at: string;
  updated_at: string;
}

export default function ExploreApprovedData() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:3000/api/reports/approved')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setReports(data.reports || []);
        console.log('Fetched approved reports:', data.reports);
      })
      .catch(() => {
        setError('Failed to load approved data.');
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.filename.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="w-8 h-8 text-cyan-700" />
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Explore Approved Data</h1>
        </div>
        <div className="mb-6 flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 pl-10"
              placeholder="Search by title or filename..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-blue-700"><Loader2 className="animate-spin mr-2" /> Loading...</div>
          ) : (
            <>
              {error && <div className="text-red-600 text-center py-2 mb-2">{error}</div>}
              {filtered.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No approved data found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-blue-100 rounded-lg">
                    <thead>
                      <tr className="bg-blue-50 text-blue-900">
                        <th className="py-2 px-2">Title</th>
                        <th className="py-2 px-2">Filename</th>
                        <th className="py-2 px-2">Message</th>
                        <th className="py-2 px-2">Submitted</th>
                        <th className="py-2 px-2">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(report => (
                        <tr key={report.id} className="border-t border-blue-100 hover:bg-blue-50">
                          <td className="py-2 px-2 font-medium">{report.title}</td>
                          <td className="py-2 px-2">{report.filename}</td>
                          <td className="py-2 px-2">{report.message}</td>
                          <td className="py-2 px-2 text-xs text-gray-500">{new Date(report.submitted_at).toLocaleDateString()}</td>
                          <td className="py-2 px-2">
                            <a
                              href={`/${report.path}`}
                              download={report.filename}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
                            >
                              <FileText className="w-4 h-4" /> Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
