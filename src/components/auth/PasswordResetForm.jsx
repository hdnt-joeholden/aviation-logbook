import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Key } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function PasswordResetForm({ onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if we have a valid recovery token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setIsValidToken(true);
    }
    setCheckingToken(false);
  }, []);

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="space-y-4 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
        <p className="text-gray-600">Verifying reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Invalid or Expired Link</h2>
        <p className="text-gray-600">
          This password reset link is invalid or has expired. Please request a new password reset link.
        </p>
        <button
          onClick={onBackToLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="text-green-600" size={48} />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Password Reset Successful!</h2>
        <p className="text-gray-600">
          Your password has been updated. You will be redirected to the login page shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 rounded-full p-2">
          <Key className="text-blue-600" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Reset Your Password</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new password"
          disabled={loading}
          minLength={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm new password"
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        <button
          onClick={onBackToLogin}
          className="text-blue-600 hover:underline"
          disabled={loading}
          type="button"
        >
          Back to Login
        </button>
      </p>
    </form>
  );
}
