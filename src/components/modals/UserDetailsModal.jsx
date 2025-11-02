import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Shield, Clock, Key, Ban, CheckCircle, Save, AlertCircle } from 'lucide-react';

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onSave,
  onSuspend,
  onActivate,
  onSendPasswordReset,
  currentUserId
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: user?.title || '',
    forename: user?.forename || '',
    surname: user?.surname || '',
    email: user?.email || '',
    date_of_birth: user?.date_of_birth || '',
    nationality: user?.nationality || ''
  });
  const [loading, setLoading] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        title: user.title || '',
        forename: user.forename || '',
        surname: user.surname || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        nationality: user.nationality || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isSuspended = user.account_status === 'suspended';
  const isCurrentUser = user.id === currentUserId;
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : 'Never';

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(user.id, formData);
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    setLoading(true);
    try {
      await onSuspend(user.id);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await onActivate(user.id);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await onSendPasswordReset(user.email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${user.is_admin ? 'bg-purple-100' : 'bg-blue-100'}`}>
              {user.is_admin ? (
                <Shield className="text-purple-600" size={20} />
              ) : (
                <User className="text-blue-600" size={20} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user.title} {user.forename} {user.surname}
              </h2>
              <p className="text-sm text-gray-500">
                {user.is_admin ? 'Administrator' : 'User'}
                {isSuspended && <span className="ml-2 text-red-600">• Suspended</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          {isSuspended && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <Ban className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-red-900">Account Suspended</p>
                <p className="text-sm text-red-700 mt-1">
                  This user cannot access their account
                </p>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User size={16} />
              Account Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {user.email || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Sign In</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {lastSignIn}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Created</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Account Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {isSuspended ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <Ban size={14} /> Suspended
                      </span>
                    ) : (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} /> Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User size={16} />
                Personal Details
              </h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </div>

            {editMode ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Forename
                    </label>
                    <input
                      type="text"
                      value={formData.forename}
                      onChange={(e) => setFormData({ ...formData, forename: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Surname
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        title: user.title || '',
                        forename: user.forename || '',
                        surname: user.surname || '',
                        email: user.email || '',
                        date_of_birth: user.date_of_birth || '',
                        nationality: user.nationality || ''
                      });
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.title} {user.forename} {user.surname}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.nationality || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle size={16} />
              Account Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={handlePasswordReset}
                disabled={loading || !user.email}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key size={18} />
                <div className="text-left">
                  <p className="font-medium text-sm">Send Password Reset Email</p>
                  <p className="text-xs text-blue-600">User will receive a password reset link</p>
                </div>
              </button>

              {!isCurrentUser && (
                <>
                  {isSuspended ? (
                    <button
                      onClick={handleActivate}
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      <div className="text-left">
                        <p className="font-medium text-sm">Activate Account</p>
                        <p className="text-xs text-green-600">User will regain access to their account</p>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={handleSuspend}
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <Ban size={18} />
                      <div className="text-left">
                        <p className="font-medium text-sm">Suspend Account</p>
                        <p className="text-xs text-red-600">User will be locked out of their account</p>
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
