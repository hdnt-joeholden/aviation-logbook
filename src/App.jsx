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
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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
      setProfileFormData({
        full_name: profile.full_name || '',
        date_of_birth: profile.date_of_birth || '',
        place_of_birth: profile.place_of_birth || '',
        nationality: profile.nationality || '',
        naa_reference: profile.naa_reference || ''
      });
    }
  }, [profile]);

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
      await register(registerEmail, registerPassword, registerName);
      setSuccess('Registration successful! Please check your email to verify your account.');
      setShowLogin(true);
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
      await reloadData();
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
              name={registerName}
              setName={setRegisterName}
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
    </div>
  );
}
