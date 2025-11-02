import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { text: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { text: 'Good', color: 'bg-blue-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    onRegister();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {inviteEmail ? 'Complete Your Invitation' : 'Register'}
      </h2>
      {inviteEmail && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
          You've been invited to join Aviation Logbook. Please complete your registration below.
        </div>
      )}
      {passwordError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {passwordError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forename(s)</label>
          <input
            type="text"
            name="given-name"
            autoComplete="given-name"
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
            name="family-name"
            autoComplete="family-name"
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
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="your@email.com"
          disabled={loading || !!inviteEmail}
          readOnly={!!inviteEmail}
          required
        />
        {inviteEmail && (
          <p className="text-xs text-gray-500 mt-1">Email is pre-filled from your invitation</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="At least 6 characters"
          disabled={loading}
          required
          minLength={6}
        />
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    i < passwordStrength ? strengthInfo.color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {strengthInfo.text && (
              <p className="text-xs text-gray-600">
                Password strength: <span className="font-medium">{strengthInfo.text}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Re-enter password"
          disabled={loading}
          required
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <XCircle size={12} />
            Passwords do not match
          </p>
        )}
        {confirmPassword && password === confirmPassword && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle size={12} />
            Passwords match
          </p>
        )}
      </div>
      <button
        type="submit"
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
            type="button"
          >
            Login
          </button>
        </p>
      )}
    </form>
  );
}