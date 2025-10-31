import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Star, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AircraftEngineLinksPanel({
  engines,
  aircraftTypes,
  aircraftEngines,
  onReloadData
}) {
  const [selectedAircraftType, setSelectedAircraftType] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [isCommon, setIsCommon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get engines linked to selected aircraft type
  const linkedEngines = useMemo(() => {
    if (!selectedAircraftType) return [];

    const links = aircraftEngines.filter(ae => ae.aircraft_type_id === selectedAircraftType);
    return links.map(link => {
      const engine = engines.find(e => e.id === link.engine_id);
      return {
        ...link,
        engine
      };
    }).filter(link => link.engine);
  }, [selectedAircraftType, aircraftEngines, engines]);

  // Get unlinked engines (available to add)
  const availableEngines = useMemo(() => {
    if (!selectedAircraftType) return [];

    const linkedEngineIds = linkedEngines.map(le => le.engine_id);
    return engines.filter(e => !linkedEngineIds.includes(e.id));
  }, [selectedAircraftType, linkedEngines, engines]);

  const handleAddLink = async () => {
    if (!selectedAircraftType || !selectedEngine) {
      setError('Please select both aircraft type and engine');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('aircraft_type_engines')
        .insert([{
          aircraft_type_id: selectedAircraftType,
          engine_id: selectedEngine,
          is_common: isCommon
        }]);

      if (insertError) throw insertError;

      setSelectedEngine('');
      setIsCommon(false);
      await onReloadData();
    } catch (err) {
      console.error('Error adding link:', err);
      setError(err.message || 'Failed to add link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Remove this engine compatibility?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('aircraft_type_engines')
        .delete()
        .eq('id', linkId);

      if (deleteError) throw deleteError;

      await onReloadData();
    } catch (err) {
      console.error('Error deleting link:', err);
      alert('Failed to delete link: ' + err.message);
    }
  };

  const handleToggleCommon = async (linkId, currentValue) => {
    try {
      const { error: updateError } = await supabase
        .from('aircraft_type_engines')
        .update({ is_common: !currentValue })
        .eq('id', linkId);

      if (updateError) throw updateError;

      await onReloadData();
    } catch (err) {
      console.error('Error updating link:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const selectedAircraftInfo = aircraftTypes.find(at => at.id === selectedAircraftType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Aircraft-Engine Compatibility</h2>
        <p className="text-sm text-gray-600">Link engines to aircraft types and mark common variants</p>
      </div>

      {/* Select Aircraft Type */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Aircraft Type
        </label>
        <select
          value={selectedAircraftType}
          onChange={(e) => {
            setSelectedAircraftType(e.target.value);
            setSelectedEngine('');
            setError('');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Choose an aircraft type...</option>
          {aircraftTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.type_code}
            </option>
          ))}
        </select>
      </div>

      {selectedAircraftType && (
        <>
          {/* Add New Link */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Plus size={18} />
              Add Compatible Engine
            </h3>

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {availableEngines.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                All engines have been linked to this aircraft type
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine
                  </label>
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  >
                    <option value="">Select an engine...</option>
                    {availableEngines.map(engine => (
                      <option key={engine.id} value={engine.id}>
                        {engine.full_designation || `${engine.manufacturer} ${engine.model}${engine.variant ? `-${engine.variant}` : ''}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_common_new"
                    checked={isCommon}
                    onChange={(e) => setIsCommon(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    disabled={loading}
                  />
                  <label htmlFor="is_common_new" className="ml-2 text-sm text-gray-700">
                    Mark as common/recommended engine option
                  </label>
                </div>

                <button
                  onClick={handleAddLink}
                  disabled={loading || !selectedEngine}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add Compatibility
                </button>
              </div>
            )}
          </div>

          {/* Linked Engines List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <LinkIcon size={18} />
                Compatible Engines for {selectedAircraftInfo?.type_code}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {linkedEngines.length} engine{linkedEngines.length !== 1 ? 's' : ''} linked
              </p>
            </div>

            {linkedEngines.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No engines linked yet</p>
                <p className="text-sm mt-1">Add compatible engines above</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {linkedEngines
                  .sort((a, b) => {
                    // Sort common engines first
                    if (a.is_common && !b.is_common) return -1;
                    if (!a.is_common && b.is_common) return 1;

                    // Then sort by manufacturer and model
                    const aName = `${a.engine.manufacturer} ${a.engine.model}`;
                    const bName = `${b.engine.manufacturer} ${b.engine.model}`;
                    return aName.localeCompare(bName);
                  })
                  .map(link => (
                    <div key={link.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleCommon(link.id, link.is_common)}
                          className={`p-1 rounded transition ${
                            link.is_common
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-300 hover:text-yellow-500'
                          }`}
                          title={link.is_common ? 'Common engine' : 'Mark as common'}
                        >
                          <Star size={20} fill={link.is_common ? 'currentColor' : 'none'} />
                        </button>
                        <div>
                          <p className="font-medium text-gray-800">
                            {link.engine.full_designation ||
                              `${link.engine.manufacturer} ${link.engine.model}${link.engine.variant ? `-${link.engine.variant}` : ''}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {link.engine.manufacturer}
                            {link.is_common && <span className="ml-2 text-yellow-600 font-medium">• Common</span>}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Remove compatibility"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedAircraftType && (
        <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
          <LinkIcon size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Select an aircraft type above to manage engine compatibility</p>
        </div>
      )}
    </div>
  );
}
