import React, { useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AircraftModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingAircraft,
  loading,
  error,
  aircraftTypes,
  engines,
  aircraftEngines
}) {
  if (!isOpen) return null;

  // Compute compatible engines based on selected aircraft type
  const compatibleEngines = useMemo(() => {
    if (!formData.aircraft_type_id) return [];

    // Get engine IDs that are compatible with this aircraft type
    const compatibleEngineIds = aircraftEngines
      .filter(ae => ae.aircraft_type_id === formData.aircraft_type_id)
      .map(ae => ae.engine_id);

    // Filter engines and add is_common flag
    return engines
      .filter(e => compatibleEngineIds.includes(e.id))
      .map(engine => {
        const link = aircraftEngines.find(
          ae => ae.aircraft_type_id === formData.aircraft_type_id && ae.engine_id === engine.id
        );
        return {
          ...engine,
          is_common: link?.is_common || false
        };
      })
      .sort((a, b) => {
        // Sort common engines first
        if (a.is_common && !b.is_common) return -1;
        if (!a.is_common && b.is_common) return 1;
        // Then sort by manufacturer and model
        return `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`);
      });
  }, [formData.aircraft_type_id, engines, aircraftEngines]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingAircraft ? 'Edit Aircraft' : 'Add Aircraft'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft Registration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.registration}
              onChange={(e) => setFormData({...formData, registration: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="G-ABCD"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">e.g., G-EZAA, N12345, D-ABCD</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.aircraft_type_id}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  aircraft_type_id: e.target.value,
                  engine_id: '' // Reset engine when aircraft type changes
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select aircraft type</option>
              {aircraftTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.type_code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.engine_id}
              onChange={(e) => setFormData({...formData, engine_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.aircraft_type_id}
            >
              <option value="">
                {!formData.aircraft_type_id
                  ? 'Select aircraft type first'
                  : 'Select engine type'}
              </option>
              {compatibleEngines.map(engine => (
                <option key={engine.id} value={engine.id}>
                  {engine.full_designation || `${engine.manufacturer} ${engine.model}${engine.variant ? `-${engine.variant}` : ''}`}
                  {engine.is_common ? ' (Common)' : ''}
                </option>
              ))}
            </select>
            {compatibleEngines.length === 0 && formData.aircraft_type_id && (
              <p className="text-xs text-amber-600 mt-1">
                No engines configured for this aircraft type. Contact admin.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Airbus, Boeing, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number (MSN)
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Manufacture
            </label>
            <input
              type="number"
              value={formData.year_of_manufacture}
              onChange={(e) => setFormData({...formData, year_of_manufacture: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional information about this aircraft..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Currently active in fleet
            </label>
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
                editingAircraft ? 'Update Aircraft' : 'Add Aircraft'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
