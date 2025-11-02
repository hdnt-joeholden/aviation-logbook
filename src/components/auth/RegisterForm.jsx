import React from 'react';
import { Loader2 } from 'lucide-react';

export default function RegisterForm({
  forename,
  setForename,
  surname,
  setSurname,
  email,
  setEmail,
  password,
  setPassword,
  onRegister,
  onSwitchToLogin,
  loading,
  inviteEmail
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {inviteEmail ? 'Complete Your Invitation' : 'Register'}
      </h2>
      {inviteEmail && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
          You've been invited to join Aviation Logbook. Please complete your registration below.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forename(s)</label>
          <input
            type="text"
            value={forename}
            onChange={(e) => setForename(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Smith"
            disabled={loading}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="your@email.com"
          disabled={loading || !!inviteEmail}
          readOnly={!!inviteEmail}
        />
        {inviteEmail && (
          <p className="text-xs text-gray-500 mt-1">Email is pre-filled from your invitation</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>
      <button
        onClick={onRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="animate-spin" size={20} /> Creating account...</> : 'Register'}
      </button>
      {!inviteEmail && (
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Login
          </button>
        </p>
      )}
    </div>
  );
}