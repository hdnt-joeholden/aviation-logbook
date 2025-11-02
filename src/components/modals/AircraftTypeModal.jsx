import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AircraftTypeModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingType,
  loading,
  error,
  aircraftTypes
}) {
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false);
  const [customManufacturer, setCustomManufacturer] = useState('');

  // Get unique manufacturers from existing aircraft types
  const existingManufacturers = aircraftTypes
    ? [...new Set(aircraftTypes
        .map(t => t.manufacturer)
        .filter(m => m && m.trim() !== ''))]
        .sort()
    : [];

  // Check if current manufacturer is custom (not in the list)
  useEffect(() => {
    if (formData.manufacturer && !existingManufacturers.includes(formData.manufacturer)) {
      setShowCustomManufacturer(true);
      setCustomManufacturer(formData.manufacturer);
    } else {
      setShowCustomManufacturer(false);
      setCustomManufacturer('');
    }
  }, [formData.manufacturer, isOpen]);

  const handleManufacturerChange = (value) => {
    if (value === '__custom__') {
      setShowCustomManufacturer(true);
      setCustomManufacturer('');
      setFormData({...formData, manufacturer: ''});
    } else {
      setShowCustomManufacturer(false);
      setFormData({...formData, manufacturer: value});
    }
  };

  if (!isOpen) return null;

  // Generate preview of full aircraft type name
  const fullTypeName = formData.manufacturer && formData.model
    ? `${formData.manufacturer} ${formData.model}`
    : formData.manufacturer || formData.model || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingType ? 'Edit Aircraft Type' : 'Add Aircraft Type'}
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
              Type Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.type_code}
              onChange={(e) => setFormData({...formData, type_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., B788, B737, A320"
              maxLength="50"
            />
            <p className="text-xs text-gray-500 mt-1">ICAO type code (will be converted to uppercase)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            {!showCustomManufacturer ? (
              <select
                value={formData.manufacturer || ''}
                onChange={(e) => handleManufacturerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select manufacturer...</option>
                {existingManufacturers.map((mfr) => (
                  <option key={mfr} value={mfr}>{mfr}</option>
                ))}
                <option value="__custom__">+ Add new manufacturer</option>
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customManufacturer}
                  onChange={(e) => {
                    setCustomManufacturer(e.target.value);
                    setFormData({...formData, manufacturer: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Boeing, Airbus, Embraer"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomManufacturer(false);
                    setFormData({...formData, manufacturer: ''});
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  ← Back to existing manufacturers
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 787-8, 737-800, A320-200"
            />
            <p className="text-xs text-gray-500 mt-1">Model name/number (manufacturer will be prefixed automatically)</p>
          </div>

          {fullTypeName && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700 font-medium mb-1">Preview:</p>
              <p className="text-sm text-blue-900">{fullTypeName}</p>
            </div>
          )}

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
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={16} /> Saving...</>
              ) : (
                editingType ? 'Update Aircraft Type' : 'Add Aircraft Type'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
