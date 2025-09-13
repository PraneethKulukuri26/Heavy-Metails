import { useState } from 'react';

const tabs = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

export function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
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
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="App Logo" className="h-12 mb-2" />
          <h1 className="text-2xl font-bold text-blue-900 text-center tracking-tight">Heavy Metal Pollution Index Portal</h1>
        </div>
        {/* Tabs */}
        <div className="flex mb-6 border-b border-blue-100">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-2 text-lg font-medium transition-colors duration-150 ${tab === t.key ? 'text-blue-700 border-b-2 border-blue-600' : 'text-gray-400'}`}
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
  return (
    <form className="space-y-5">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-blue-900">Email Address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@university.edu"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
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
        />
      </div>
      <div className="flex items-center justify-between">
        <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
      </div>
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-800 transition-colors"
      >
        Login
      </button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="space-y-5">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-blue-900">Full Name</label>
        <input
          id="register-name"
          type="text"
          required
          placeholder="Dr. Jane Smith"
          className="mt-1 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900"
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
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 mt-2 bg-blue-700 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-800 transition-colors"
      >
        Register
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">Only verified researchers/scientists will be approved by Admin.</p>
    </form>
  );
}
