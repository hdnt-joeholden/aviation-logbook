import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Plane, AlertCircle } from 'lucide-react';
import AircraftTypeModal from '../modals/AircraftTypeModal';
import ConfirmModal from '../modals/ConfirmModal';
import { supabase } from '../../lib/supabaseClient';

export default function AircraftTypeManagementPanel({ aircraftTypes, onReloadData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    type_code: '',
    type_name: '',
    manufacturer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    showCancel: true,
    confirmText: 'Confirm',
    onConfirm: () => {}
  });

  const openModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        type_code: type.type_code,
        type_name: type.type_name || '',
        manufacturer: type.manufacturer || ''
      });
    } else {
      setEditingType(null);
      setFormData({
        type_code: '',
        type_name: '',
        manufacturer: ''
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.type_code) {
      setError('Type code is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingType) {
        // Update existing aircraft type
        const { error: updateError } = await supabase
          .from('aircraft_types')
          .update({
            type_code: formData.type_code.toUpperCase(),
            type_name: formData.type_name || null,
            manufacturer: formData.manufacturer || null
          })
          .eq('id', editingType.id);

        if (updateError) throw updateError;
      } else {
        // Insert new aircraft type
        const { error: insertError } = await supabase
          .from('aircraft_types')
          .insert([{
            type_code: formData.type_code.toUpperCase(),
            type_name: formData.type_name || null,
            manufacturer: formData.manufacturer || null
          }]);

        if (insertError) throw insertError;
      }

      await onReloadData();
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to save aircraft type');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (typeId) => {
    try {
      // First check if any aircraft are using this type
      const { data: aircraftData, count: aircraftCount, error: countError } = await supabase
        .from('user_aircraft')
        .select('registration, user_id', { count: 'exact' })
        .eq('aircraft_type_id', typeId);

      if (countError) {
        throw countError;
      }

      // Also check if any aircraft-engine links use this type
      const { data: linkData, count: linkCount, error: linkCountError } = await supabase
        .from('aircraft_type_engines')
        .select('engines(model, manufacturer)', { count: 'exact' })
        .eq('aircraft_type_id', typeId);

      if (linkCountError) {
        throw linkCountError;
      }


      const totalUsage = (aircraftCount || 0) + (linkCount || 0);

      if (totalUsage > 0) {
        // Build detailed message about references
        let detailMessage = 'This aircraft type is currently being used by:\n\n';

        if (aircraftCount > 0) {
          detailMessage += `**User Aircraft (${aircraftCount}):**\n`;

          // Fetch user profiles for each aircraft
          for (const aircraft of aircraftData) {
            let owner = 'Unknown owner';
            if (aircraft.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('forename, surname')
                .eq('id', aircraft.user_id)
                .single();

              if (profile) {
                owner = `${profile.forename || ''} ${profile.surname || ''}`.trim() || 'Unknown owner';
              }
            }
            detailMessage += `• ${aircraft.registration} (${owner})\n`;
          }
          detailMessage += '\n';
        }

        if (linkCount > 0) {
          detailMessage += `**Engine Links (${linkCount}):**\n`;
          linkData.forEach(link => {
            const engine = link.engines
              ? `${link.engines.manufacturer} ${link.engines.model}`.trim()
              : 'Unknown engine';
            detailMessage += `• ${engine}\n`;
          });
        }

        detailMessage += '\nPlease remove these references first before deleting this aircraft type.';

        setConfirmModal({
          isOpen: true,
          title: 'Cannot Delete Aircraft Type',
          message: detailMessage,
          variant: 'warning',
          showCancel: false,
          confirmText: 'OK',
          onConfirm: () => {}
        });
        return;
      }

      // Show confirmation dialog
      setConfirmModal({
        isOpen: true,
        title: 'Delete Aircraft Type',
        message: 'Are you sure you want to delete this aircraft type? This action cannot be undone.',
        variant: 'danger',
        showCancel: true,
        confirmText: 'Delete',
        onConfirm: async () => {
          try {

            const { data: deleteData, error: deleteError } = await supabase
              .from('aircraft_types')
              .delete()
              .eq('id', typeId)
              .select();


            if (deleteError) throw deleteError;

            await onReloadData();

            setConfirmModal({
              isOpen: true,
              title: 'Success',
              message: 'Aircraft type deleted successfully',
              variant: 'success',
              showCancel: false,
              confirmText: 'OK',
              onConfirm: () => {}
            });
          } catch (err) {
            setConfirmModal({
              isOpen: true,
              title: 'Error',
              message: `Failed to delete aircraft type: ${err.message}`,
              variant: 'danger',
              showCancel: false,
              confirmText: 'OK',
              onConfirm: () => {}
            });
          }
        }
      });
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to check aircraft type usage: ${err.message}`,
        variant: 'danger',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {}
      });
    }
  };

  // Group aircraft types by manufacturer
  const typesByManufacturer = aircraftTypes.reduce((acc, type) => {
    const mfr = type.manufacturer || 'Other';
    if (!acc[mfr]) {
      acc[mfr] = [];
    }
    acc[mfr].push(type);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Aircraft Types Database</h2>
          <p className="text-sm text-gray-600">Manage all available aircraft types</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Aircraft Type
        </button>
      </div>

      {aircraftTypes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Plane size={48} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No aircraft types yet</h3>
          <p className="text-gray-600 mb-4">Add your first aircraft type to get started</p>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Add Aircraft Type
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(typesByManufacturer)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([manufacturer, manufacturerTypes]) => (
              <div key={manufacturer} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{manufacturer}</h3>
                  <p className="text-xs text-gray-500">{manufacturerTypes.length} aircraft type{manufacturerTypes.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {manufacturerTypes
                    .sort((a, b) => a.type_code.localeCompare(b.type_code))
                    .map(type => (
                      <div key={type.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {type.type_code}
                          </p>
                          <p className="text-sm text-gray-500">
                            {type.type_name || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(type)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Edit aircraft type"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete aircraft type"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <AircraftTypeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingType={editingType}
        loading={loading}
        error={error}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        showCancel={confirmModal.showCancel}
        confirmText={confirmModal.confirmText}
      />
    </>
  );
}
