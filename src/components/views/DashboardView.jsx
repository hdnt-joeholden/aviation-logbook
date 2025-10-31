import React from 'react';
import { BookOpen, Plane, Users, Calendar, Clock, PlusCircle, TrendingUp } from 'lucide-react';

export default function DashboardView({
  entries,
  userAircraft,
  supervisors,
  onOpenEntryModal,
  onViewChange
}) {
  // Calculate statistics
  const stats = {
    totalEntries: entries.length,
    totalAircraft: userAircraft.length,
    totalSupervisors: supervisors.length,
    recentEntries: entries.slice(0, 5)
  };

  // Get entries from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEntries = entries.filter(e => new Date(e.entry_date) >= thirtyDaysAgo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your logbook overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entries */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
              <p className="text-xs text-gray-500 mt-2">{recentEntries.length} in last 30 days</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Aircraft */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Aircraft</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAircraft}</p>
              <p className="text-xs text-gray-500 mt-2">Registered aircraft</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Plane className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Supervisors */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Supervisors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSupervisors}</p>
              <p className="text-xs text-gray-500 mt-2">Active supervisors</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Activity This Month */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{recentEntries.length}</p>
              <p className="text-xs text-gray-500 mt-2">Entries logged</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onOpenEntryModal}
            className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
          >
            <PlusCircle size={20} />
            <div className="text-left">
              <p className="font-medium">Add Logbook Entry</p>
              <p className="text-xs text-blue-600">Record your work</p>
            </div>
          </button>

          <button
            onClick={() => onViewChange('aircraft')}
            className="flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
          >
            <Plane size={20} />
            <div className="text-left">
              <p className="font-medium">Manage Aircraft</p>
              <p className="text-xs text-purple-600">Add or edit aircraft</p>
            </div>
          </button>

          <button
            onClick={() => onViewChange('supervisors')}
            className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
          >
            <Users size={20} />
            <div className="text-left">
              <p className="font-medium">Manage Supervisors</p>
              <p className="text-xs text-green-600">Add or edit supervisors</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No entries yet</p>
              <p className="text-sm mt-1">Start by adding your first logbook entry</p>
              <button
                onClick={onOpenEntryModal}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
              >
                Add Entry
              </button>
            </div>
          ) : (
            stats.recentEntries.map(entry => {
              const aircraft = userAircraft.find(a => a.id === entry.aircraft_id);
              const supervisor = supervisors.find(s => s.id === entry.supervisor_id);

              return (
                <div key={entry.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {new Date(entry.entry_date).toLocaleDateString('en-GB')}
                        </span>
                        {aircraft && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Plane size={14} />
                            {aircraft.registration}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">
                        {entry.ata_chapter} - {entry.task_description}
                      </p>
                      {supervisor && (
                        <p className="text-sm text-gray-600">
                          Supervisor: {supervisor.name}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {stats.recentEntries.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => onViewChange('logbook')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all entries →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
