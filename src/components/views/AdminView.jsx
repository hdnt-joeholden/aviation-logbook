import React, { useState } from 'react';
import { Shield, Wrench, Link, LayoutDashboard, Users } from 'lucide-react';
import AdminDashboard from '../admin/AdminDashboard';
import EngineManagementPanel from '../admin/EngineManagementPanel';
import AircraftEngineLinksPanel from '../admin/AircraftEngineLinksPanel';
import UserManagementPanel from '../admin/UserManagementPanel';

export default function AdminView({
  engines,
  aircraftTypes,
  aircraftEngines,
  onReloadData,
  currentUserId
}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'engines', label: 'Engines', icon: Wrench },
    { id: 'links', label: 'Aircraft-Engine Links', icon: Link }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-purple-100">
          Manage master data for aircraft types, engines, and compatibility relationships
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              engines={engines}
              aircraftTypes={aircraftTypes}
              aircraftEngines={aircraftEngines}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementPanel
              currentUserId={currentUserId}
            />
          )}

          {activeTab === 'engines' && (
            <EngineManagementPanel
              engines={engines}
              onReloadData={onReloadData}
            />
          )}

          {activeTab === 'links' && (
            <AircraftEngineLinksPanel
              engines={engines}
              aircraftTypes={aircraftTypes}
              aircraftEngines={aircraftEngines}
              onReloadData={onReloadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
