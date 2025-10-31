import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function EngineModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingEngine,
  loading,
  error
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingEngine ? 'Edit Engine' : 'Add Engine'}
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
              Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Rolls-Royce, GE, Pratt & Whitney"
            />
            <p className="text-xs text-gray-500 mt-1">The engine manufacturer name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Trent, GEnx, LEAP"
            />
            <p className="text-xs text-gray-500 mt-1">The engine model/family name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variant
            </label>
            <input
              type="text"
              value={formData.variant}
              onChange={(e) => setFormData({...formData, variant: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 1000-J, 1B70, 7B27"
            />
            <p className="text-xs text-gray-500 mt-1">Specific variant/version (optional but recommended)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Designation
            </label>
            <input
              type="text"
              value={formData.full_designation}
              onChange={(e) => setFormData({...formData, full_designation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Trent 1000-J, GEnx-1B70"
            />
            <p className="text-xs text-gray-500 mt-1">
              Full engine designation as displayed to users (auto-generated if not provided)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Preview:</span>{' '}
              {formData.full_designation ||
                `${formData.manufacturer || '...'} ${formData.model || '...'}${formData.variant ? `-${formData.variant}` : ''}`}
            </p>
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
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={16} /> Saving...</>
              ) : (
                editingEngine ? 'Update Engine' : 'Add Engine'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
