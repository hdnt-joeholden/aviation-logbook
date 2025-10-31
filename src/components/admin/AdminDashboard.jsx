import React, { useState, useEffect } from 'react';
import { Users, Plane, Wrench, Link as LinkIcon, BookOpen, TrendingUp, Database } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard({ engines, aircraftTypes, aircraftEngines }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    totalAircraft: 0,
    totalEntries: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Count total users
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Count admin users
      const { count: adminCount, error: adminError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true);

      if (adminError) throw adminError;

      // Count total user aircraft
      const { count: aircraftCount, error: aircraftError } = await supabase
        .from('user_aircraft')
        .select('*', { count: 'exact', head: true });

      if (aircraftError) throw aircraftError;

      // Count total logbook entries
      const { count: entriesCount, error: entriesError } = await supabase
        .from('logbook_entries')
        .select('*', { count: 'exact', head: true });

      if (entriesError) throw entriesError;

      // Get recent activity (last 5 entries)
      const { data: recentData, error: recentError } = await supabase
        .from('logbook_entries')
        .select(`
          id,
          entry_date,
          task_description,
          created_at,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setStats({
        totalUsers: userCount || 0,
        adminUsers: adminCount || 0,
        totalAircraft: aircraftCount || 0,
        totalEntries: entriesCount || 0,
        recentActivity: recentData || []
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate coverage stats
  const aircraftTypesWithEngines = new Set(aircraftEngines.map(ae => ae.aircraft_type_id));
  const coveragePercentage = aircraftTypes.length > 0
    ? Math.round((aircraftTypesWithEngines.size / aircraftTypes.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Total Users</h3>
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
          <p className="text-sm text-blue-700 mt-1">{stats.adminUsers} admin{stats.adminUsers !== 1 ? 's' : ''}</p>
        </div>

        {/* Aircraft Types */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900">Aircraft Types</h3>
            <Plane className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-900">{aircraftTypes.length}</p>
          <p className="text-sm text-purple-700 mt-1">{stats.totalAircraft} in fleets</p>
        </div>

        {/* Engines */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Engine Types</h3>
            <Wrench className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-900">{engines.length}</p>
          <p className="text-sm text-green-700 mt-1">{aircraftEngines.length} links</p>
        </div>

        {/* Logbook Entries */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-900">Log Entries</h3>
            <BookOpen className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-orange-900">{stats.totalEntries}</p>
          <p className="text-sm text-orange-700 mt-1">Across all users</p>
        </div>
      </div>

      {/* Coverage & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Coverage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-purple-600" size={20} />
            <h3 className="font-semibold text-gray-800">Aircraft-Engine Coverage</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Aircraft types with engines</span>
                <span className="font-medium text-gray-900">{aircraftTypesWithEngines.size} / {aircraftTypes.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${coveragePercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">System health</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total engines</p>
                  <p className="text-lg font-semibold text-gray-900">{engines.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total links</p>
                  <p className="text-lg font-semibold text-gray-900">{aircraftEngines.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg per aircraft</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {aircraftTypesWithEngines.size > 0
                      ? (aircraftEngines.length / aircraftTypesWithEngines.size).toFixed(1)
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 italic">Loading...</p>
          ) : stats.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {activity.task_description}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {activity.profiles?.first_name} {activity.profiles?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.entry_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Engines per manufacturer</p>
            <p className="text-lg font-semibold text-gray-900">
              {engines.length > 0
                ? (engines.length / new Set(engines.map(e => e.manufacturer)).size).toFixed(1)
                : '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Unique manufacturers</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Set(engines.map(e => e.manufacturer)).size}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Active users</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.totalUsers - stats.adminUsers}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Entries per user</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.totalUsers > 0
                ? (stats.totalEntries / stats.totalUsers).toFixed(1)
                : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
