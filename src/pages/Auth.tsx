import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

const tabs = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

export function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-cyan-50 relative overflow-hidden">
      {/* Subtle scientific background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10 select-none">
        <svg width="100%" height="100%" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="60" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <circle cx="500" cy="300" r="40" stroke="#64748b" strokeWidth="1.5" fill="none" />
          <ellipse cx="300" cy="200" rx="120" ry="60" stroke="#60a5fa" strokeWidth="1" fill="none" />
          <g>
            <circle cx="200" cy="320" r="12" fill="#e0e7ef" />
            <circle cx="400" cy="80" r="8" fill="#e0e7ef" />
          </g>
        </svg>
      </div>
  <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-cyan-100">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <img src="/cgwb_logo.png" onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.svg'; }} alt="CGWB Logo" className="h-12 w-12 rounded-full ring-1 ring-black/10 dark:ring-white/10 bg-white mb-2" />
          <h1 className="text-2xl font-bold text-cyan-900 text-center tracking-tight">Heavy Metal Pollution Index Portal</h1>
        </div>
        {/* Tabs */}
        <div className="flex mb-6 border-b border-cyan-100">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-2 text-lg font-medium transition-colors duration-150 ${tab === t.key ? 'text-cyan-700 border-b-2 border-cyan-600' : 'text-gray-400'}`}
              onClick={() => setTab(t.key as 'login' | 'register')}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Login successful!');
      // Store user id in localStorage for later use
      if (data && data.user) {
        localStorage.setItem('user_id', data.user.id);
      }
      // Redirect to /home after short delay
      setTimeout(() => {
        navigate('/home');
      }, 800);
    }
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleLogin}>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {success && <div className="text-green-700 text-sm text-center">{success}</div>}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-blue-900">Email Address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@university.edu"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-blue-900">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
      </div>
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-800 transition-colors"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [field, setField] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          institution,
          field,
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Insert into researchers table if user created
    const user = data?.user;
    if (user) {
      const { error: insertError } = await supabase.from('researchers').insert([
        {
          id: user.id,
          name,
          institution,
          field,
          email,
        },
      ]);
      if (insertError) {
        setError('Registration succeeded, but failed to save profile: ' + insertError.message);
        setLoading(false);
        return;
      }
    }
    setSuccess('Registration successful! Please check your email to verify your account.');
    setName('');
    setEmail('');
    setInstitution('');
    setField('');
    setPassword('');
    setConfirm('');
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleRegister}>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {success && <div className="text-green-700 text-sm text-center">{success}</div>}
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-blue-900">Full Name</label>
        <input
          id="register-name"
          type="text"
          required
          placeholder="Dr. Jane Smith"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-blue-900">Email Address</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@university.edu"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="register-institution" className="block text-sm font-medium text-blue-900">Institution/Organization</label>
        <input
          id="register-institution"
          type="text"
          required
          placeholder="University of Science"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={institution}
          onChange={e => setInstitution(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="register-field" className="block text-sm font-medium text-blue-900">Research Field</label>
        <input
          id="register-field"
          type="text"
          required
          placeholder="Environmental Chemistry"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={field}
          onChange={e => setField(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-blue-900">Password</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Password"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="register-confirm" className="block text-sm font-medium text-blue-900">Confirm Password</label>
        <input
          id="register-confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Confirm Password"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-800 transition-colors"
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">Only verified researchers/scientists will be approved by Admin.</p>
    </form>
  );
}
