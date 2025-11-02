import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteUserConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user
}) {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmailInput('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const userName = `${user.title} ${user.forename} ${user.surname}`;
  const userEmail = user.email;
  const accountCreated = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleConfirm = () => {
    if (emailInput !== userEmail) {
      setError('Email address does not match. Please type the exact email address.');
      return;
    }

    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">⚠️ FINAL CONFIRMATION</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-100 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="font-bold text-red-900 mb-3">
              You are about to PERMANENTLY DELETE:
            </p>
            <div className="space-y-2 text-sm text-red-800">
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">User:</span>
                <span>{userName}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Email:</span>
                <span className="font-mono">{userEmail}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Created:</span>
                <span>{accountCreated}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">
              All associated data will be deleted:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Logbook entries</li>
              <li>Aircraft</li>
              <li>Supervisors</li>
              <li>Employment history</li>
              <li>Addresses</li>
              <li>Profile information</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-bold text-yellow-900 text-center">
              ⚠️ THIS ACTION CANNOT BE UNDONE ⚠️
            </p>
          </div>

          {/* Email Verification */}
          <div className="pt-4 border-t-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              To confirm deletion, please type the user's email address exactly:
            </label>
            <div className="mb-2 px-3 py-2 bg-gray-100 rounded font-mono text-sm text-gray-700 border border-gray-300">
              {userEmail}
            </div>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
              placeholder="Type email address here"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!emailInput}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
