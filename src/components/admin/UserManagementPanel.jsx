import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, Users, Search, Mail, Calendar, UserPlus, X, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function UserManagementPanel({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    is_admin: false
  });

  useEffect(() => {
    loadUsers();
    loadInvites();
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

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          invited_by_profile:profiles!invited_by(full_name)
        `)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (err) {
      console.error('Error loading invites:', err);
      // Don't show error if table doesn't exist yet
    }
  };

  const handleInviteUser = async () => {
    try {
      setError('');

      // Validate form
      if (!inviteForm.email || !inviteForm.full_name) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', inviteForm.email.toLowerCase())
        .single();

      if (existingUser) {
        setError('A user with this email already exists');
        return;
      }

      // Check if there's a pending invite
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('*')
        .eq('email', inviteForm.email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        setError('An invite has already been sent to this email');
        return;
      }

      // Create invite record
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          email: inviteForm.email.toLowerCase(),
          full_name: inviteForm.full_name,
          invited_by: currentUserId
        });

      if (inviteError) throw inviteError;

      // TODO: Implement email sending via Supabase Edge Function or backend service
      // For now, the admin will need to manually share the signup link
      // The signup link should include the invite email as a parameter

      const signupUrl = `${window.location.origin}/?invite=${encodeURIComponent(inviteForm.email.toLowerCase())}`;

      setSuccess(
        `Invite created for ${inviteForm.email}. Share this signup link with them: ${signupUrl}`
      );

      // Reset form and close modal
      setInviteForm({ email: '', full_name: '', is_admin: false });
      setShowInviteModal(false);

      // Reload invites
      await loadInvites();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user');
    }
  };

  const cancelInvite = async (inviteId, email) => {
    if (!confirm(`Cancel invite for ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'expired' })
        .eq('id', inviteId);

      if (error) throw error;

      setSuccess('Invite cancelled');
      await loadInvites();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling invite:', err);
      setError(err.message || 'Failed to cancel invite');
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

  // Filter pending invites
  const pendingInvites = invites.filter(inv => inv.status === 'pending' && new Date(inv.expires_at) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-600">Manage user accounts and admin privileges</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{users.length}</span> users
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            <UserPlus size={18} />
            Invite User
          </button>
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
          {success.includes('signup link') && (
            <button
              onClick={() => {
                const urlMatch = success.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                  navigator.clipboard.writeText(urlMatch[0]);
                  setSuccess(success + ' (Link copied!)');
                  setTimeout(() => setSuccess(''), 3000);
                }
              }}
              className="ml-2 underline font-medium"
            >
              Copy Link
            </button>
          )}
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
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Send size={18} />
                  Pending Invites ({pendingInvites.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="mb-2">
                          <p className="font-medium text-gray-900">
                            {invite.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail size={14} />
                            {invite.email}
                          </p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Invited {new Date(invite.invited_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </span>
                          {invite.invited_by_profile && (
                            <span>by {invite.invited_by_profile.full_name}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => cancelInvite(invite.id, invite.email)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm transition"
                        title="Cancel invite"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserPlus size={20} />
                Invite New User
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteForm({ email: '', full_name: '', is_admin: false });
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Smith"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={inviteForm.is_admin}
                  onChange={(e) => setInviteForm({...inviteForm, is_admin: e.target.checked})}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_admin" className="text-sm text-gray-700 flex items-center gap-2">
                  <Shield size={16} className="text-purple-600" />
                  Grant admin privileges
                </label>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-md p-3">
                <p><strong>Note:</strong> The invited user will receive an email with instructions to create their account. The invite will expire in 7 days.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteForm({ email: '', full_name: '', is_admin: false });
                  setError('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Send size={16} />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
