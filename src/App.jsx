import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Download, LogOut, User, Users, BookOpen, Loader2, Settings } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AviationLogbook() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState('logbook');
  const [entries, setEntries] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [ataChapters, setAtaChapters] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [formData, setFormData] = useState({
    entry_date: '',
    aircraft_type: '',
    job_number: '',
    ata_chapter: '',
    task_description: '',
    supervisor_id: '',
    notes: ''
  });

  const [supervisorFormData, setSupervisorFormData] = useState({
    approval_number: '',
    name: '',
    company: ''
  });

  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    naa_reference: ''
  });

  const [addressFormData, setAddressFormData] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    from_date: '',
    to_date: '',
    is_current: false
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('logbook_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (entriesError) throw entriesError;
      setEntries(entriesData || []);

      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('supervisors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (supervisorsError) throw supervisorsError;
      setSupervisors(supervisorsData || []);

      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircraft_types')
        .select('*')
        .order('type_code');
      
      if (aircraftError) throw aircraftError;
      setAircraftTypes(aircraftData || []);

      const { data: ataData, error: ataError } = await supabase
        .from('ata_chapters')
        .select('*')
        .order('chapter_code');
      
      if (ataError) throw ataError;
      setAtaChapters(ataData || []);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);
      if (profileData) {
        setProfileFormData({
          full_name: profileData.full_name || '',
          date_of_birth: profileData.date_of_birth || '',
          place_of_birth: profileData.place_of_birth || '',
          nationality: profileData.nationality || '',
          naa_reference: profileData.naa_reference || ''
        });
      }

      const { data: addressesData, error: addressesError } = await supabase
        .from('address_history')
        .select('*')
        .order('from_date', { ascending: false });
      
      if (addressesError) throw addressesError;
      setAddresses(addressesData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      setSuccess('Logged in successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setError('');
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName
          }
        }
      });
      
      if (error) throw error;
      setSuccess('Registration successful! Please check your email to verify your account.');
      setShowLogin(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEntries([]);
    setSupervisors([]);
    setProfile(null);
    setAddresses([]);
    setCurrentView('logbook');
  };

  const handleUpdateProfile = async () => {
    try {
      if (!profileFormData.full_name) {
        setError('Full name is required');
        return;
      }

      setError('');
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileFormData
        });
      
      if (error) throw error;
      setSuccess('Profile updated successfully!');
      await loadUserData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || '',
        city: address.city,
        county: address.county || '',
        postcode: address.postcode,
        country: address.country,
        from_date: address.from_date,
        to_date: address.to_date || '',
        is_current: address.is_current
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        address_line_1: '',
        address_line_2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom',
        from_date: '',
        to_date: '',
        is_current: false
      });
    }
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setError('');
  };

  const handleSubmitAddress = async () => {
    try {
      if (!addressFormData.address_line_1 || !addressFormData.city || 
          !addressFormData.postcode || !addressFormData.from_date) {
        setError('Please fill in all required fields');
        return;
      }

      setError('');
      setLoading(true);

      if (addressFormData.is_current) {
        await supabase
          .from('address_history')
          .update({ is_current: false })
          .neq('id', editingAddress?.id || '00000000-0000-0000-0000-000000000000');
      }

      const addressData = {
        ...addressFormData,
        user_id: user.id,
        to_date: addressFormData.to_date || null
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('address_history')
          .update(addressData)
          .eq('id', editingAddress.id);
        
        if (error) throw error;
        setSuccess('Address updated successfully!');
      } else {
        const { error } = await supabase
          .from('address_history')
          .insert([addressData]);
        
        if (error) throw error;
        setSuccess('Address added successfully!');
      }

      await loadUserData();
      closeAddressModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('address_history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSuccess('Address deleted successfully!');
      await loadUserData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEntryModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        entry_date: entry.entry_date,
        aircraft_type: entry.aircraft_type,
        job_number: entry.job_number,
        ata_chapter: entry.ata_chapter,
        task_description: entry.task_description,
        supervisor_id: entry.supervisor_id || '',
        notes: entry.notes || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        aircraft_type: '',
        job_number: '',
        ata_chapter: '',
        task_description: '',
        supervisor_id: '',
        notes: ''
      });
    }
    setShowEntryModal(true);
  };

  const closeEntryModal = () => {
    setShowEntryModal(false);
    setEditingEntry(null);
    setError('');
  };

  const handleSubmitEntry = async () => {
    try {
      if (!formData.entry_date || !formData.aircraft_type || !formData.job_number || 
          !formData.ata_chapter || !formData.task_description) {
        setError('Please fill in all required fields');
        return;
      }

      setError('');
      setLoading(true);

      const entryData = {
        ...formData,
        user_id: user.id,
        supervisor_id: formData.supervisor_id || null
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('logbook_entries')
          .update(entryData)
          .eq('id', editingEntry.id);
        
        if (error) throw error;
        setSuccess('Entry updated successfully!');
      } else {
        const { error } = await supabase
          .from('logbook_entries')
          .insert([entryData]);
        
        if (error) throw error;
        setSuccess('Entry created successfully!');
      }

      await loadUserData();
      closeEntryModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('logbook_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSuccess('Entry deleted successfully!');
      await loadUserData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openSupervisorModal = (supervisor = null) => {
    if (supervisor) {
      setEditingSupervisor(supervisor);
      setSupervisorFormData({
        approval_number: supervisor.approval_number,
        name: supervisor.name,
        company: supervisor.company
      });
    } else {
      setEditingSupervisor(null);
      setSupervisorFormData({
        approval_number: '',
        name: '',
        company: ''
      });
    }
    setShowSupervisorModal(true);
  };

  const closeSupervisorModal = () => {
    setShowSupervisorModal(false);
    setEditingSupervisor(null);
    setError('');
  };

  const handleSubmitSupervisor = async () => {
    try {
      if (!supervisorFormData.approval_number || !supervisorFormData.name || !supervisorFormData.company) {
        setError('Please fill in all required fields');
        return;
      }

      setError('');
      setLoading(true);

      const supervisorData = {
        ...supervisorFormData,
        user_id: user.id
      };

      if (editingSupervisor) {
        const { error } = await supabase
          .from('supervisors')
          .update(supervisorData)
          .eq('id', editingSupervisor.id);
        
        if (error) throw error;
        setSuccess('Supervisor updated successfully!');
      } else {
        const { error } = await supabase
          .from('supervisors')
          .insert([supervisorData]);
        
        if (error) throw error;
        setSuccess('Supervisor added successfully!');
      }

      await loadUserData();
      closeSupervisorModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupervisor = async (id) => {
    if (!confirm('Are you sure you want to delete this supervisor?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('supervisors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSuccess('Supervisor deleted successfully!');
      await loadUserData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const entriesByAircraft = entries.reduce((acc, entry) => {
    if (!acc[entry.aircraft_type]) acc[entry.aircraft_type] = [];
    acc[entry.aircraft_type].push(entry);
    return acc;
  }, {});

  const getSupervisorDisplay = (supervisorId) => {
    const supervisor = supervisors.find(s => s.id === supervisorId);
    if (!supervisor) return 'No supervisor assigned';
    return `${supervisor.approval_number} – ${supervisor.name} – ${supervisor.company}`;
  };

  const getAtaDisplay = (ataCode) => {
    const ata = ataChapters.find(a => a.chapter_code === ataCode);
    return ata ? `${ata.chapter_code} - ${ata.chapter_name}` : ataCode;
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aviation Logbook</h1>
            <p className="text-gray-600">Professional maintenance record keeping</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {showLogin ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Login</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Logging in...</> : 'Login'}
              </button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Register
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Register</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Creating account...</> : 'Register'}
              </button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-blue-600 hover:underline"
                  disabled={loading}
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Aviation Logbook</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setCurrentView('logbook')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                currentView === 'logbook'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <BookOpen size={18} />
              Logbook
            </button>
            <button
              onClick={() => setCurrentView('supervisors')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                currentView === 'supervisors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Users size={18} />
              Supervisors
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                currentView === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Settings size={18} />
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X size={16} />
            </button>
          </div>
        )}

        {currentView === 'profile' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileFormData.full_name}
                      onChange={(e) => setProfileFormData({...profileFormData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileFormData.date_of_birth}
                      onChange={(e) => setProfileFormData({...profileFormData, date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      value={profileFormData.place_of_birth}
                      onChange={(e) => setProfileFormData({...profileFormData, place_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="London, United Kingdom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={profileFormData.nationality}
                      onChange={(e) => setProfileFormData({...profileFormData, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="British"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NAA Reference Number
                  </label>
                  <input
                    type="text"
                    value={profileFormData.naa_reference}
                    onChange={(e) => setProfileFormData({...profileFormData, naa_reference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="UK.XXXXX"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Address History</h2>
                <button
                  onClick={() => openAddressModal()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={18} />
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No addresses recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {address.is_current && (
                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">
                              Current Address
                            </span>
                          )}
                          <p className="font-medium text-gray-800">{address.address_line_1}</p>
                          {address.address_line_2 && (
                            <p className="text-gray-600">{address.address_line_2}</p>
                          )}
                          <p className="text-gray-600">{address.city}{address.county && `, ${address.county}`}</p>
                          <p className="text-gray-600">{address.postcode}</p>
                          <p className="text-gray-600">{address.country}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            From: {new Date(address.from_date).toLocaleDateString('en-GB')}
                            {address.to_date && ` - To: ${new Date(address.to_date).toLocaleDateString('en-GB')}`}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openAddressModal(address)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteAddress(address.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'logbook' ? (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => openEntryModal()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  New Entry
                </button>
                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition">
                  <Download size={20} />
                  Export PDF
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Total Entries: <span className="font-semibold">{entries.length}</span>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus size={64} className="mx-auto mb-2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries yet</h3>
                <p className="text-gray-600 mb-6">Start building your professional logbook</p>
                <button
                  onClick={() => openEntryModal()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                >
                  Create Your First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(entriesByAircraft).sort().map(aircraft => (
                  <div key={aircraft} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-600 text-white px-4 py-3">
                      <h2 className="text-lg font-semibold">{aircraft}</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {entriesByAircraft[aircraft]
                        .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
                        .map(entry => (
                          <div key={entry.id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {new Date(entry.entry_date).toLocaleDateString('en-GB')}
                                  </span>
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    Job: {entry.job_number}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {getAtaDisplay(entry.ata_chapter)}
                                  </span>
                                </div>
                                <p className="text-gray-800 font-medium mb-1">{entry.task_description}</p>
                                <p className="text-sm text-gray-600 mb-2">
                                  Supervisor: {getSupervisorDisplay(entry.supervisor_id)}
                                </p>
                                {entry.notes && (
                                  <p className="text-sm text-gray-500 italic">Notes: {entry.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => openEntryModal(entry)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => openSupervisorModal()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Add Supervisor
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Total Supervisors: <span className="font-semibold">{supervisors.length}</span>
              </div>
            </div>

            {supervisors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Users size={64} className="mx-auto mb-2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No supervisors yet</h3>
                <p className="text-gray-600 mb-6">Add supervisors to assign them to your logbook entries</p>
                <button
                  onClick={() => openSupervisorModal()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                >
                  Add Your First Supervisor
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {supervisors.map(supervisor => (
                    <div key={supervisor.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{supervisor.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Approval No:</span> {supervisor.approval_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Company:</span> {supervisor.company}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openSupervisorModal(supervisor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteSupervisor(supervisor.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </h2>
              <button
                onClick={closeAddressModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
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
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressFormData.address_line_1}
                  onChange={(e) => setAddressFormData({...addressFormData, address_line_1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressFormData.address_line_2}
                  onChange={(e) => setAddressFormData({...addressFormData, address_line_2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="London"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <input
                    type="text"
                    value={addressFormData.county}
                    onChange={(e) => setAddressFormData({...addressFormData, county: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Greater London"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.postcode}
                    onChange={(e) => setAddressFormData({...addressFormData, postcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SW1A 1AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="United Kingdom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={addressFormData.from_date}
                    onChange={(e) => setAddressFormData({...addressFormData, from_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date (leave blank if current)
                  </label>
                  <input
                    type="date"
                    value={addressFormData.to_date}
                    onChange={(e) => setAddressFormData({...addressFormData, to_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={addressFormData.is_current}
                  onChange={(e) => setAddressFormData({...addressFormData, is_current: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_current" className="ml-2 text-sm text-gray-700">
                  This is my current address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeAddressModal}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAddress}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Saving...</>
                  ) : (
                    editingAddress ? 'Update Address' : 'Add Address'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingEntry ? 'Edit Entry' : 'New Logbook Entry'}
              </h2>
              <button
                onClick={closeEntryModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aircraft Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.aircraft_type}
                    onChange={(e) => setFormData({...formData, aircraft_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select aircraft</option>
                    {aircraftTypes.map(type => (
                      <option key={type.id} value={type.type_code}>{type.type_code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.job_number}
                    onChange={(e) => setFormData({...formData, job_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JOB-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ATA Chapter <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ata_chapter}
                    onChange={(e) => setFormData({...formData, ata_chapter: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select ATA chapter</option>
                    {ataChapters.map(ata => (
                      <option key={ata.id} value={ata.chapter_code}>
                        {ata.chapter_code} - {ata.chapter_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.task_description}
                  onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the maintenance task performed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor
                </label>
                <select
                  value={formData.supervisor_id}
                  onChange={(e) => setFormData({...formData, supervisor_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No supervisor assigned</option>
                  {supervisors.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.approval_number} – {sup.name} – {sup.company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or observations..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeEntryModal}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEntry}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Saving...</>
                  ) : (
                    editingEntry ? 'Update Entry' : 'Create Entry'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSupervisorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingSupervisor ? 'Edit Supervisor' : 'Add Supervisor'}
              </h2>
              <button
                onClick={closeSupervisorModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
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
                  Approval Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supervisorFormData.approval_number}
                  onChange={(e) => setSupervisorFormData({...supervisorFormData, approval_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., UK.145.12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supervisorFormData.name}
                  onChange={(e) => setSupervisorFormData({...supervisorFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supervisorFormData.company}
                  onChange={(e) => setSupervisorFormData({...supervisorFormData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC Maintenance Ltd"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeSupervisorModal}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSupervisor}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Saving...</>
                  ) : (
                    editingSupervisor ? 'Update Supervisor' : 'Add Supervisor'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}