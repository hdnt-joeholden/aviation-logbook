import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, Users, Search, Mail, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function UserManagementPanel({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles (email is now stored in profiles table)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId, currentStatus, userName) => {
    if (userId === currentUserId) {
      setError("You cannot change your own admin status");
      return;
    }

    const action = currentStatus ? 'remove admin access from' : 'grant admin access to';
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(`Successfully ${currentStatus ? 'removed admin access' : 'granted admin access'}`);
      await loadUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating admin status:', err);
      setError(err.message || 'Failed to update admin status');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Separate admins and regular users
  const adminUsers = filteredUsers.filter(u => u.is_admin);
  const regularUsers = filteredUsers.filter(u => !u.is_admin);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-600">Manage user accounts and admin privileges</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{users.length}</span> users
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admin Users */}
          {adminUsers.length > 0 && (
            <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Shield size={18} />
                  Administrators ({adminUsers.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {adminUsers.map(user => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={14} />
                              {user.email}
                            </p>
                          </div>
                          {user.id === currentUserId && (
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAdminStatus(user.id, true, user.full_name)}
                        disabled={user.id === currentUserId}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                          user.id === currentUserId
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                        title={user.id === currentUserId ? 'Cannot modify your own status' : 'Remove admin access'}
                      >
                        <ShieldOff size={16} />
                        Revoke Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Users */}
          {regularUsers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={18} />
                  Regular Users ({regularUsers.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {regularUsers.map(user => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="mb-2">
                          <p className="font-medium text-gray-900">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAdminStatus(user.id, false, user.full_name)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm transition"
                        title="Grant admin access"
                      >
                        <Shield size={16} />
                        Make Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
