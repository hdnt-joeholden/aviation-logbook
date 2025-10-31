import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function EntryModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingEntry,
  loading,
  error,
  userAircraft,
  aircraftTypes,
  ataChapters,
  supervisors
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingEntry ? 'Edit Entry' : 'New Logbook Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
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
                Aircraft <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.aircraft_id}
                onChange={(e) => setFormData({...formData, aircraft_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select aircraft</option>
                {userAircraft.filter(a => a.is_active).map(aircraft => {
                  const typeInfo = aircraftTypes.find(t => t.id === aircraft.aircraft_type_id);
                  return (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.registration} ({typeInfo?.type_code || 'Unknown'})
                    </option>
                  );
                })}
              </select>
              {userAircraft.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No aircraft added yet. Add aircraft in the Aircraft tab first.
                </p>
              )}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
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
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
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
  );
}
