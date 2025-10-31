import React from 'react';
import { BookOpen, Users, Plane, Settings } from 'lucide-react';

export default function Navigation({ currentView, onViewChange }) {
  const tabs = [
    { id: 'logbook', label: 'Logbook', icon: BookOpen },
    { id: 'aircraft', label: 'Aircraft', icon: Plane },
    { id: 'supervisors', label: 'Supervisors', icon: Users },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  currentView === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}