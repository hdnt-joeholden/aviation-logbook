import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
  loading
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Login</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="your@email.com"
          disabled={loading}
          required
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          {onForgotPassword && (
            <button
              onClick={onForgotPassword}
              className="text-xs text-blue-600 hover:underline"
              disabled={loading}
              type="button"
            >
              Forgot password?
            </button>
          )}
        </div>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          disabled={loading}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="animate-spin" size={20} /> Logging in...</> : 'Login'}
      </button>
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline"
          disabled={loading}
          type="button"
        >
          Register
        </button>
      </p>
    </form>
  );
}