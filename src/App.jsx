import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { generateCAP741PDF } from './pdfExport';
import { X } from 'lucide-react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useLogbookData } from './hooks/useLogbookData';
import { useModalState } from './hooks/useModalState';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import Alert from './components/common/Alert';
import ConfirmDialog from './components/common/ConfirmDialog';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';

// Modals
import AddressModal from './components/modals/AddressModal';
import EmploymentModal from './components/modals/EmploymentModal';
import EntryModal from './components/modals/EntryModal';
import SupervisorModal from './components/modals/SupervisorModal';
import AircraftModal from './components/modals/AircraftModal';

// Views
import DashboardView from './components/views/DashboardView';
import ProfileView from './components/views/ProfileView';
import LogbookView from './components/views/LogbookView';
import SupervisorsView from './components/views/SupervisorsView';
import AircraftView from './components/views/AircraftView';
import AdminView from './components/views/AdminView';

export default function AviationLogbook() {
  const { user, loading: authLoading, login, register, logout } = useAuth();
  const {
    entries,
    supervisors,
    aircraftTypes,
    userAircraft,
    engines,
    aircraftEngines,
    ataChapters,
    profile,
    addresses,
    employmentHistory,
    loading: dataLoading,
    reloadData
  } = useLogbookData(user);

  const {
    showEntryModal,
    showSupervisorModal,
    showAddressModal,
    showEmploymentModal,
    editingEntry,
    editingSupervisor,
    editingAddress,
    editingEmployment,
    openEntryModal,
    closeEntryModal,
    openSupervisorModal,
    closeSupervisorModal,
    openAddressModal,
    closeAddressModal,
    openEmploymentModal,
    closeEmploymentModal
  } = useModalState();

  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Auth form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerForename, setRegisterForename] = useState('');
  const [registerSurname, setRegisterSurname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Profile completion state
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);

  // Check for invite parameter in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invite = urlParams.get('invite');
    if (invite) {
      setInviteEmail(invite);
      setRegisterEmail(invite);
      setShowLogin(false); // Show registration form
    }
  }, []);

  // Form data states
  const [formData, setFormData] = useState({
    entry_date: '',
    aircraft_id: '',
    job_number: '',
    ata_chapter: '',
    task_description: '',
    supervisor_id: '',
    notes: ''
  });

  const [supervisorFormData, setSupervisorFormData] = useState({
    name: '',
    license_number: '',
    approval_number: '',
    company: ''
  });

  const [profileFormData, setProfileFormData] = useState({
    title: '',
    forename: '',
    surname: '',
    date_of_birth: '',
    nationality: '',
    licence_number: '',
    // Note: permanent_address and postcode are not stored in profiles table
    // They are display-only fields populated from address_history
    permanent_address: '', // Display only
    postcode: '' // Display only
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

  const [employmentFormData, setEmploymentFormData] = useState({
    company_name: '',
    company_approval_number: '',
    position: '',
    duties: '',
    from_date: '',
    to_date: '',
    is_current: false
  });

  const [aircraftFormData, setAircraftFormData] = useState({
    registration: '',
    aircraft_type_id: '',
    engine_id: '',
    manufacturer: '',
    serial_number: '',
    year_of_manufacture: '',
    notes: '',
    is_active: true
  });

  // Aircraft modal state
  const [showAircraftModal, setShowAircraftModal] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);

  // Update profile form data when profile loads
  React.useEffect(() => {
    if (profile) {
      // Always populate address from current address in address_history
      let permanentAddress = '';
      let postcode = '';

      const currentAddress = addresses?.find(addr => addr.is_current);
      if (currentAddress) {
        // Construct permanent address from address fields
        const addressParts = [
          currentAddress.address_line_1,
          currentAddress.address_line_2,
          currentAddress.city,
          currentAddress.county
        ].filter(Boolean); // Remove empty values
        permanentAddress = addressParts.join('\n');
        postcode = currentAddress.postcode || '';
      }

      setProfileFormData({
        title: profile.title || '',
        forename: profile.forename || '',
        surname: profile.surname || '',
        date_of_birth: profile.date_of_birth || '',
        nationality: profile.nationality || '',
        licence_number: profile.licence_number || '',
        permanent_address: permanentAddress,
        postcode: postcode
      });
    }
  }, [profile, addresses]);

  // Check if profile is complete - if not, force user to complete it
  React.useEffect(() => {
    console.log('Profile completion effect triggered:', {
      hasUser: !!user,
      hasProfile: !!profile,
      dataLoading: dataLoading,
      addressCount: addresses?.length || 0
    });

    if (user && profile && !dataLoading) {
      const isProfileComplete =
        profile.title &&
        profile.forename &&
        profile.surname &&
        profile.date_of_birth &&
        profile.nationality &&
        addresses?.some(addr => addr.is_current); // Must have a current address

      console.log('Profile completion check:', {
        hasTitle: !!profile.title,
        hasForename: !!profile.forename,
        hasSurname: !!profile.surname,
        hasDOB: !!profile.date_of_birth,
        hasNationality: !!profile.nationality,
        hasCurrentAddress: addresses?.some(addr => addr.is_current),
        isComplete: isProfileComplete
      });

      if (!isProfileComplete) {
        console.log('Profile incomplete - showing modal');
        setShowProfileCompletionModal(true);
        setCurrentView('profile'); // Force them to profile view
      } else {
        console.log('Profile is complete - no modal needed');
      }
    }
  }, [user, profile, addresses, dataLoading]);

  // Auth handlers
  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await login(loginEmail, loginPassword);
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

      // If registering via invite, validate the invite
      let inviteData = null;
      if (inviteEmail) {
        const { data, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('email', inviteEmail.toLowerCase())
          .eq('status', 'pending')
          .single();

        if (inviteError || !data) {
          setError('Invalid or expired invite. Please contact an administrator.');
          setLoading(false);
          return;
        }

        // Check if invite is expired
        if (new Date(data.expires_at) < new Date()) {
          setError('This invite has expired. Please contact an administrator.');
          setLoading(false);
          return;
        }

        inviteData = data;
      }

      // Register the user
      await register(registerEmail, registerPassword, registerForename, registerSurname);

      // If invite exists, mark it as accepted and apply admin privileges
      if (inviteData) {
        // Wait a moment for the auth user and profile to be created
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the newly created user
        const { data: { user: newUser } } = await supabase.auth.getUser();

        if (newUser) {
          // Update invite status
          await supabase
            .from('invites')
            .update({
              status: 'accepted',
              accepted_at: new Date().toISOString()
            })
            .eq('id', inviteData.id);

          // Apply admin privileges if granted
          if (inviteData.is_admin) {
            await supabase
              .from('profiles')
              .update({ is_admin: true })
              .eq('id', newUser.id);
          }

          // Ensure email is saved to profile and mark account as active
          await supabase
            .from('profiles')
            .update({
              email: registerEmail.toLowerCase(),
              account_status: 'active'  // Mark as active now that they've completed registration
            })
            .eq('id', newUser.id);
        }
      }

      setSuccess('Registration successful! Please check your email to verify your account.');
      setShowLogin(true);
      setInviteEmail(''); // Clear invite

      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('logbook');
  };

  // Profile handlers
  const handleUpdateProfile = async () => {
    try {
      // Validate required fields
      if (!profileFormData.title || !profileFormData.forename || !profileFormData.surname) {
        setError('Title, forename, and surname are required');
        return;
      }
      if (!profileFormData.date_of_birth) {
        setError('Date of birth is required');
        return;
      }
      if (!profileFormData.nationality) {
        setError('Nationality is required');
        return;
      }

      // Check that user has a current address in address_history
      const hasCurrentAddress = addresses?.some(addr => addr.is_current);
      if (!hasCurrentAddress) {
        setError('Please add a current address in the Address History section below');
        return;
      }

      setError('');
      setLoading(true);

      // Extract only the fields that should be saved to profiles table
      // (permanent_address and postcode are NOT saved - they come from address_history)
      const { permanent_address, postcode, ...profileDataToSave } = profileFormData;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileDataToSave,
          // Also update email if it exists in the form
          email: user.email
        });

      if (error) throw error;
      setSuccess('Profile updated successfully!');
      await reloadData();

      // Check if profile is now complete and close the completion modal if it is
      const updatedProfile = { ...profile, ...profileDataToSave };
      const isNowComplete =
        updatedProfile.title &&
        updatedProfile.forename &&
        updatedProfile.surname &&
        updatedProfile.date_of_birth &&
        updatedProfile.nationality &&
        hasCurrentAddress; // Already declared above

      if (isNowComplete) {
        setShowProfileCompletionModal(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Address handlers
  const handleOpenAddressModal = (address = null) => {
    if (address) {
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
    openAddressModal(address);
  };

  const handleCloseAddressModal = () => {
    closeAddressModal();
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
        const { error: updateError } = await supabase
          .from('address_history')
          .update({ is_current: false })
          .neq('id', editingAddress?.id || '00000000-0000-0000-0000-000000000000');

        if (updateError) throw updateError;
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

      await reloadData();
      handleCloseAddressModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from('address_history')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setSuccess('Address deleted successfully!');
          await reloadData();
        } catch (err) {
          setError(err.message || 'Failed to delete address');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Employment handlers
  const handleOpenEmploymentModal = (employment = null) => {
    if (employment) {
      setEmploymentFormData({
        company_name: employment.company_name,
        company_approval_number: employment.company_approval_number || '',
        position: employment.position,
        duties: employment.duties || '',
        from_date: employment.from_date,
        to_date: employment.to_date || '',
        is_current: employment.is_current
      });
    } else {
      setEmploymentFormData({
        company_name: '',
        company_approval_number: '',
        position: '',
        duties: '',
        from_date: '',
        to_date: '',
        is_current: false
      });
    }
    openEmploymentModal(employment);
  };

  const handleCloseEmploymentModal = () => {
    closeEmploymentModal();
    setError('');
  };

  const handleSubmitEmployment = async () => {
    try {
      if (!employmentFormData.company_name || !employmentFormData.position || !employmentFormData.from_date) {
        setError('Please fill in all required fields');
        return;
      }

      setError('');
      setLoading(true);

      if (employmentFormData.is_current) {
        const { error: updateError } = await supabase
          .from('employment_history')
          .update({ is_current: false })
          .neq('id', editingEmployment?.id || '00000000-0000-0000-0000-000000000000');

        if (updateError) throw updateError;
      }

      const employmentData = {
        ...employmentFormData,
        user_id: user.id,
        to_date: employmentFormData.to_date || null
      };

      if (editingEmployment) {
        const { error } = await supabase
          .from('employment_history')
          .update(employmentData)
          .eq('id', editingEmployment.id);

        if (error) throw error;
        setSuccess('Employment record updated successfully!');
      } else {
        const { error } = await supabase
          .from('employment_history')
          .insert([employmentData]);

        if (error) throw error;
        setSuccess('Employment record added successfully!');
      }

      await reloadData();
      handleCloseEmploymentModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployment = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Employment Record',
      message: 'Are you sure you want to delete this employment record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from('employment_history')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setSuccess('Employment record deleted successfully!');
          await reloadData();
        } catch (err) {
          setError(err.message || 'Failed to delete employment record');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Aircraft handlers
  const handleOpenAircraftModal = (aircraft = null) => {
    if (aircraft) {
      setEditingAircraft(aircraft);
      setAircraftFormData({
        registration: aircraft.registration,
        aircraft_type_id: aircraft.aircraft_type_id,
        engine_id: aircraft.engine_id || '',
        manufacturer: aircraft.manufacturer || '',
        serial_number: aircraft.serial_number || '',
        year_of_manufacture: aircraft.year_of_manufacture || '',
        notes: aircraft.notes || '',
        is_active: aircraft.is_active
      });
    } else {
      setEditingAircraft(null);
      setAircraftFormData({
        registration: '',
        aircraft_type_id: '',
        engine_id: '',
        manufacturer: '',
        serial_number: '',
        year_of_manufacture: '',
        notes: '',
        is_active: true
      });
    }
    setShowAircraftModal(true);
  };

  const handleCloseAircraftModal = () => {
    setShowAircraftModal(false);
    setEditingAircraft(null);
    setError('');
  };

  const handleSubmitAircraft = async () => {
    try {
      if (!aircraftFormData.registration || !aircraftFormData.aircraft_type_id || !aircraftFormData.engine_id) {
        setError('Please fill in all required fields (registration, aircraft type, and engine)');
        return;
      }

      setError('');
      setLoading(true);

      const aircraftData = {
        registration: aircraftFormData.registration.toUpperCase(),
        aircraft_type_id: aircraftFormData.aircraft_type_id,
        engine_id: aircraftFormData.engine_id,
        manufacturer: aircraftFormData.manufacturer || null,
        serial_number: aircraftFormData.serial_number || null,
        year_of_manufacture: aircraftFormData.year_of_manufacture ? parseInt(aircraftFormData.year_of_manufacture) : null,
        notes: aircraftFormData.notes || null,
        is_active: aircraftFormData.is_active,
        user_id: user.id
      };

      if (editingAircraft) {
        const { error } = await supabase
          .from('user_aircraft')
          .update(aircraftData)
          .eq('id', editingAircraft.id);

        if (error) throw error;
        setSuccess('Aircraft updated successfully!');
      } else {
        const { error } = await supabase
          .from('user_aircraft')
          .insert([aircraftData]);

        if (error) throw error;
        setSuccess('Aircraft added successfully!');
      }

      await reloadData();
      handleCloseAircraftModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAircraft = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Aircraft',
      message: 'Are you sure you want to delete this aircraft? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setLoading(true);
          const { error } = await supabase
            .from('user_aircraft')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setSuccess('Aircraft deleted successfully!');
          await reloadData();
        } catch (err) {
          setError(err.message || 'Failed to delete aircraft');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Entry handlers
  const handleOpenEntryModal = (entry = null) => {
    if (entry) {
      setFormData({
        entry_date: entry.entry_date,
        aircraft_id: entry.aircraft_id || '',
        job_number: entry.job_number,
        ata_chapter: entry.ata_chapter,
        task_description: entry.task_description,
        supervisor_id: entry.supervisor_id || '',
        notes: entry.notes || ''
      });
    } else {
      setFormData({
        entry_date: new Date().toISOString().split('T')[0],
        aircraft_id: '',
        job_number: '',
        ata_chapter: '',
        task_description: '',
        supervisor_id: '',
        notes: ''
      });
    }
    openEntryModal(entry);
  };

  const handleCloseEntryModal = () => {
    closeEntryModal();
    setError('');
  };

  const handleSubmitEntry = async () => {
    try {
      if (!formData.entry_date || !formData.aircraft_id || !formData.job_number ||
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

      await reloadData();
      handleCloseEntryModal();
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
      await reloadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supervisor handlers
  const handleOpenSupervisorModal = (supervisor = null) => {
    if (supervisor) {
      setSupervisorFormData({
        name: supervisor.name,
        license_number: supervisor.license_number || '',
        approval_number: supervisor.approval_number,
        company: supervisor.company
      });
    } else {
      setSupervisorFormData({
        name: '',
        license_number: '',
        approval_number: '',
        company: ''
      });
    }
    openSupervisorModal(supervisor);
  };

  const handleCloseSupervisorModal = () => {
    closeSupervisorModal();
    setError('');
  };

  const handleSubmitSupervisor = async () => {
    try {
      if (!supervisorFormData.name || !supervisorFormData.license_number || !supervisorFormData.approval_number || !supervisorFormData.company) {
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

      await reloadData();
      handleCloseSupervisorModal();
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
      await reloadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading && !user) {
    return <LoadingSpinner />;
  }

  // Login/Register view
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aviation Logbook</h1>
            <p className="text-gray-600">Professional maintenance record keeping</p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          {showLogin ? (
            <LoginForm
              email={loginEmail}
              setEmail={setLoginEmail}
              password={loginPassword}
              setPassword={setLoginPassword}
              onLogin={handleLogin}
              onSwitchToRegister={() => {
                setShowLogin(false);
                setError('');
                setSuccess('');
              }}
              loading={loading}
            />
          ) : (
            <RegisterForm
              forename={registerForename}
              setForename={setRegisterForename}
              surname={registerSurname}
              setSurname={setRegisterSurname}
              email={registerEmail}
              setEmail={setRegisterEmail}
              password={registerPassword}
              setPassword={setRegisterPassword}
              onRegister={handleRegister}
              onSwitchToLogin={() => {
                setShowLogin(true);
                setError('');
                setSuccess('');
              }}
              loading={loading}
              inviteEmail={inviteEmail}
            />
          )}
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = profile?.is_admin || false;

  // Main application view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} onLogout={handleLogout} />
      <Navigation currentView={currentView} onViewChange={setCurrentView} isAdmin={isAdmin} />

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

        {currentView === 'dashboard' ? (
          <DashboardView
            entries={entries}
            userAircraft={userAircraft}
            supervisors={supervisors}
            onOpenEntryModal={handleOpenEntryModal}
            onViewChange={setCurrentView}
          />
        ) : currentView === 'profile' ? (
          <ProfileView
            profileFormData={profileFormData}
            setProfileFormData={setProfileFormData}
            onUpdateProfile={handleUpdateProfile}
            addresses={addresses}
            onOpenAddressModal={handleOpenAddressModal}
            onDeleteAddress={deleteAddress}
            employmentHistory={employmentHistory}
            onOpenEmploymentModal={handleOpenEmploymentModal}
            onDeleteEmployment={deleteEmployment}
            loading={loading}
          />
        ) : currentView === 'logbook' ? (
          <LogbookView
            entries={entries}
            onOpenEntryModal={handleOpenEntryModal}
            onDeleteEntry={deleteEntry}
            onExportPDF={() => generateCAP741PDF({ profile, addresses, employmentHistory, entries, supervisors })}
            supervisors={supervisors}
            userAircraft={userAircraft}
            aircraftTypes={aircraftTypes}
            ataChapters={ataChapters}
          />
        ) : currentView === 'aircraft' ? (
          <AircraftView
            userAircraft={userAircraft}
            onOpenAircraftModal={handleOpenAircraftModal}
            onDeleteAircraft={deleteAircraft}
            aircraftTypes={aircraftTypes}
            engines={engines}
          />
        ) : currentView === 'supervisors' ? (
          <SupervisorsView
            supervisors={supervisors}
            onOpenSupervisorModal={handleOpenSupervisorModal}
            onDeleteSupervisor={deleteSupervisor}
          />
        ) : currentView === 'admin' && isAdmin ? (
          <AdminView
            engines={engines}
            aircraftTypes={aircraftTypes}
            aircraftEngines={aircraftEngines}
            onReloadData={reloadData}
            currentUserId={user.id}
          />
        ) : null}
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={handleCloseAddressModal}
        formData={addressFormData}
        setFormData={setAddressFormData}
        onSubmit={handleSubmitAddress}
        editingAddress={editingAddress}
        loading={loading}
        error={error}
      />

      <EmploymentModal
        isOpen={showEmploymentModal}
        onClose={handleCloseEmploymentModal}
        formData={employmentFormData}
        setFormData={setEmploymentFormData}
        onSubmit={handleSubmitEmployment}
        editingEmployment={editingEmployment}
        loading={loading}
        error={error}
      />

      <EntryModal
        isOpen={showEntryModal}
        onClose={handleCloseEntryModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitEntry}
        editingEntry={editingEntry}
        loading={loading}
        error={error}
        userAircraft={userAircraft}
        aircraftTypes={aircraftTypes}
        ataChapters={ataChapters}
        supervisors={supervisors}
      />

      <AircraftModal
        isOpen={showAircraftModal}
        onClose={handleCloseAircraftModal}
        formData={aircraftFormData}
        setFormData={setAircraftFormData}
        onSubmit={handleSubmitAircraft}
        editingAircraft={editingAircraft}
        loading={loading}
        error={error}
        aircraftTypes={aircraftTypes}
        engines={engines}
        aircraftEngines={aircraftEngines}
      />

      <SupervisorModal
        isOpen={showSupervisorModal}
        onClose={handleCloseSupervisorModal}
        formData={supervisorFormData}
        setFormData={setSupervisorFormData}
        onSubmit={handleSubmitSupervisor}
        editingSupervisor={editingSupervisor}
        loading={loading}
        error={error}
        employmentHistory={employmentHistory}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Profile Completion Modal - Prevents navigation until profile is complete */}
      {showProfileCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <h2 className="text-2xl font-bold text-red-900">Complete Your Profile Required</h2>
              <p className="text-red-700 mt-2">
                You must complete all required profile information before accessing the application.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What you need to provide:</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <span className={profileFormData.title ? "text-green-600" : "text-red-600"}>
                      {profileFormData.title ? "✓" : "○"}
                    </span>
                    Title (Mr, Mrs, Ms, Miss, Dr, Prof, Rev)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={profileFormData.forename ? "text-green-600" : "text-red-600"}>
                      {profileFormData.forename ? "✓" : "○"}
                    </span>
                    Forename(s)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={profileFormData.surname ? "text-green-600" : "text-red-600"}>
                      {profileFormData.surname ? "✓" : "○"}
                    </span>
                    Surname
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={profileFormData.date_of_birth ? "text-green-600" : "text-red-600"}>
                      {profileFormData.date_of_birth ? "✓" : "○"}
                    </span>
                    Date of Birth
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={profileFormData.nationality ? "text-green-600" : "text-red-600"}>
                      {profileFormData.nationality ? "✓" : "○"}
                    </span>
                    Nationality
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={addresses?.some(addr => addr.is_current) ? "text-green-600" : "text-red-600"}>
                      {addresses?.some(addr => addr.is_current) ? "✓" : "○"}
                    </span>
                    Current Address (add in Address History section below)
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please scroll down to fill in your personal information and add your current address in the Address History section.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const hasCurrentAddress = addresses?.some(addr => addr.is_current);
                    const isComplete =
                      profileFormData.title &&
                      profileFormData.forename &&
                      profileFormData.surname &&
                      profileFormData.date_of_birth &&
                      profileFormData.nationality &&
                      hasCurrentAddress;

                    if (isComplete) {
                      setShowProfileCompletionModal(false);
                    } else {
                      setError('Please complete all required fields before continuing');
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  I've Completed My Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
