import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ userEmail, onLogout }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Aviation Logbook</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}