import React, { useMemo } from 'react';
import { Plus, Edit2, Trash2, Plane, Building2 } from 'lucide-react';

export default function AircraftView({
  userAircraft,
  onOpenAircraftModal,
  onDeleteAircraft,
  aircraftTypes,
  engines
}) {
  const getAircraftTypeInfo = (typeId) => {
    return aircraftTypes.find(t => t.id === typeId);
  };

  const getEngineInfo = (engineId) => {
    return engines.find(e => e.id === engineId);
  };

  // Group aircraft by airline
  const aircraftByAirline = useMemo(() => {
    const grouped = {};

    userAircraft.forEach(aircraft => {
      const airline = aircraft.airline || 'Unassigned';
      if (!grouped[airline]) {
        grouped[airline] = [];
      }
      grouped[airline].push(aircraft);
    });

    // Sort airlines alphabetically, but put 'Unassigned' last
    const sortedAirlines = Object.keys(grouped).sort((a, b) => {
      if (a === 'Unassigned') return 1;
      if (b === 'Unassigned') return -1;
      return a.localeCompare(b);
    });

    return sortedAirlines.map(airline => ({
      airline,
      aircraft: grouped[airline].sort((a, b) => a.registration.localeCompare(b.registration))
    }));
  }, [userAircraft]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onOpenAircraftModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Aircraft
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Total Aircraft: <span className="font-semibold">{userAircraft.length}</span>
          {aircraftByAirline.length > 0 && (
            <span className="ml-4">
              Airlines: <span className="font-semibold text-blue-600">{aircraftByAirline.filter(g => g.airline !== 'Unassigned').length}</span>
            </span>
          )}
        </div>
      </div>

      {userAircraft.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Plane size={64} className="mx-auto mb-2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No aircraft yet</h3>
          <p className="text-gray-600 mb-6">Add aircraft to your fleet to start logging maintenance work</p>
          <button
            onClick={() => onOpenAircraftModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Add Your First Aircraft
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {aircraftByAirline.map(({ airline, aircraft }) => (
            <div key={airline} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`px-4 py-3 ${airline === 'Unassigned' ? 'bg-gray-500' : 'bg-blue-600'} text-white`}>
                <div className="flex items-center gap-2">
                  <Building2 size={20} />
                  <h2 className="text-lg font-semibold">{airline}</h2>
                  <span className="text-sm opacity-90">({aircraft.length} aircraft)</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {aircraft.map(aircraft => {
                  const typeInfo = getAircraftTypeInfo(aircraft.aircraft_type_id);
                  const engineInfo = getEngineInfo(aircraft.engine_id);
                  return (
                    <div key={aircraft.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{aircraft.registration}</h3>
                          </div>

                          {typeInfo && (
                            <div className="mb-1">
                              <p className="text-gray-700">
                                <span className="font-medium">{typeInfo.type_code}</span>
                                {typeInfo.manufacturer && typeInfo.model && (
                                  <span className="text-gray-600 ml-2">
                                    - {typeInfo.manufacturer} {typeInfo.model}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {engineInfo && (
                            <p className="text-sm text-gray-600">
                              Engine: {engineInfo.full_designation || `${engineInfo.manufacturer} ${engineInfo.model}`}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onOpenAircraftModal(aircraft)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Edit aircraft"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteAircraft(aircraft.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete aircraft"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
