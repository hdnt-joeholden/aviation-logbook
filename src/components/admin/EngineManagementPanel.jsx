import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wrench, AlertCircle } from 'lucide-react';
import EngineModal from '../modals/EngineModal';
import ConfirmModal from '../modals/ConfirmModal';
import { supabase } from '../../lib/supabaseClient';

export default function EngineManagementPanel({ engines, onReloadData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    variant: '',
    full_designation: ''
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

  const openModal = (engine = null) => {
    if (engine) {
      setEditingEngine(engine);
      setFormData({
        manufacturer: engine.manufacturer,
        model: engine.model,
        variant: engine.variant || '',
        full_designation: engine.full_designation || ''
      });
    } else {
      setEditingEngine(null);
      setFormData({
        manufacturer: '',
        model: '',
        variant: '',
        full_designation: ''
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEngine(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.manufacturer || !formData.model) {
      setError('Manufacturer and model are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingEngine) {
        // Update existing engine
        const { error: updateError } = await supabase
          .from('engines')
          .update({
            manufacturer: formData.manufacturer,
            model: formData.model,
            variant: formData.variant || null,
            full_designation: formData.full_designation || null
          })
          .eq('id', editingEngine.id);

        if (updateError) throw updateError;
      } else {
        // Insert new engine
        const { error: insertError } = await supabase
          .from('engines')
          .insert([{
            manufacturer: formData.manufacturer,
            model: formData.model,
            variant: formData.variant || null,
            full_designation: formData.full_designation || null
          }]);

        if (insertError) throw insertError;
      }

      await onReloadData();
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to save engine');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (engineId) => {
    try {
      // Check if any user aircraft are using this engine
      const { data: aircraftData, count: aircraftCount, error: countError } = await supabase
        .from('user_aircraft')
        .select('registration, user_id', { count: 'exact' })
        .eq('engine_id', engineId);

      if (countError) {
        throw countError;
      }


      // Also check if any aircraft type links use this engine
      const { data: linkData, count: linkCount, error: linkCountError } = await supabase
        .from('aircraft_type_engines')
        .select('aircraft_type_id', { count: 'exact' })
        .eq('engine_id', engineId);

      if (linkCountError) {
        throw linkCountError;
      }


      // Use count if available, otherwise use data array length
      const actualAircraftCount = aircraftCount !== null ? aircraftCount : (aircraftData?.length || 0);
      const actualLinkCount = linkCount !== null ? linkCount : (linkData?.length || 0);


      const totalUsage = actualAircraftCount + actualLinkCount;

      if (totalUsage > 0) {
        // Build detailed message about references
        let detailMessage = 'This engine is currently being used by:\n\n';

        if (actualAircraftCount > 0) {
          detailMessage += `**User Aircraft (${actualAircraftCount}):**\n`;

          // Fetch user profiles for each aircraft
          for (const aircraft of aircraftData || []) {
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

        if (actualLinkCount > 0) {
          detailMessage += `**Aircraft Type Links (${actualLinkCount}):**\n`;
          detailMessage += `This engine is compatible with ${actualLinkCount} aircraft type(s)\n`;
        }

        detailMessage += '\nPlease remove these references first before deleting this engine.';

        setConfirmModal({
          isOpen: true,
          title: 'Cannot Delete Engine',
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
        title: 'Delete Engine',
        message: 'Are you sure you want to delete this engine? This action cannot be undone.',
        variant: 'danger',
        showCancel: true,
        confirmText: 'Delete',
        onConfirm: async () => {
          try {

            const { data: deleteData, error: deleteError } = await supabase
              .from('engines')
              .delete()
              .eq('id', engineId)
              .select();


            if (deleteError) throw deleteError;

            await onReloadData();

            setConfirmModal({
              isOpen: true,
              title: 'Success',
              message: 'Engine deleted successfully',
              variant: 'success',
              showCancel: false,
              confirmText: 'OK',
              onConfirm: () => {}
            });
          } catch (err) {

            // Check if it's a foreign key constraint error
            if (err.code === '23503' && err.message?.includes('user_aircraft')) {
              setConfirmModal({
                isOpen: true,
                title: 'Cannot Delete Engine',
                message: 'This engine is currently being used by one or more aircraft. Please remove the engine from all aircraft before deleting it.',
                variant: 'warning',
                showCancel: false,
                confirmText: 'OK',
                onConfirm: () => {}
              });
            } else {
              setConfirmModal({
                isOpen: true,
                title: 'Error',
                message: `Failed to delete engine: ${err.message}`,
                variant: 'danger',
                showCancel: false,
                confirmText: 'OK',
                onConfirm: () => {}
              });
            }
          }
        }
      });
    } catch (err) {
      setConfirmModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to check engine usage: ${err.message}`,
        variant: 'danger',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {}
      });
    }
  };

  // Group engines by manufacturer
  const enginesByManufacturer = engines.reduce((acc, engine) => {
    if (!acc[engine.manufacturer]) {
      acc[engine.manufacturer] = [];
    }
    acc[engine.manufacturer].push(engine);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Engine Database</h2>
          <p className="text-sm text-gray-600">Manage all available engine types</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Engine
        </button>
      </div>

      {engines.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Wrench size={48} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No engines yet</h3>
          <p className="text-gray-600 mb-4">Add your first engine to get started</p>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Add Engine
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(enginesByManufacturer)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([manufacturer, manufacturerEngines]) => (
              <div key={manufacturer} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{manufacturer}</h3>
                  <p className="text-xs text-gray-500">{manufacturerEngines.length} engine{manufacturerEngines.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {manufacturerEngines
                    .sort((a, b) => {
                      const aStr = `${a.model} ${a.variant || ''}`;
                      const bStr = `${b.model} ${b.variant || ''}`;
                      return aStr.localeCompare(bStr);
                    })
                    .map(engine => (
                      <div key={engine.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">
                            {engine.full_designation || `${engine.manufacturer} ${engine.model}${engine.variant ? `-${engine.variant}` : ''}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Model: {engine.model}
                            {engine.variant && ` • Variant: ${engine.variant}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(engine)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Edit engine"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(engine.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete engine"
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

      <EngineModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingEngine={editingEngine}
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
