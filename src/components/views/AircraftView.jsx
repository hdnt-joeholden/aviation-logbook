import React from 'react';
import { Plus, Edit2, Trash2, Plane, AlertCircle } from 'lucide-react';

export default function AircraftView({
  userAircraft,
  onOpenAircraftModal,
  onDeleteAircraft,
  aircraftTypes
}) {
  const getAircraftTypeInfo = (typeId) => {
    return aircraftTypes.find(t => t.id === typeId);
  };

  const activeAircraft = userAircraft.filter(a => a.is_active);
  const inactiveAircraft = userAircraft.filter(a => !a.is_active);

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
          {activeAircraft.length > 0 && (
            <span className="ml-4">Active: <span className="font-semibold text-green-600">{activeAircraft.length}</span></span>
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
          {/* Active Aircraft */}
          {activeAircraft.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-600 text-white px-4 py-3">
                <h2 className="text-lg font-semibold">Active Aircraft</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {activeAircraft.map(aircraft => {
                  const typeInfo = getAircraftTypeInfo(aircraft.aircraft_type_id);
                  return (
                    <div key={aircraft.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{aircraft.registration}</h3>
                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              Active
                            </span>
                          </div>

                          {typeInfo && (
                            <div className="mb-2">
                              <p className="text-lg text-gray-700 font-medium">
                                {typeInfo.type_code} - {typeInfo.type_name}
                              </p>
                              {typeInfo.engine_type && (
                                <p className="text-sm text-gray-600">
                                  Engine: {typeInfo.engine_type}
                                  {typeInfo.engine_variant && ` (${typeInfo.engine_variant})`}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                            {aircraft.manufacturer && (
                              <p><span className="font-medium">Manufacturer:</span> {aircraft.manufacturer}</p>
                            )}
                            {aircraft.serial_number && (
                              <p><span className="font-medium">MSN:</span> {aircraft.serial_number}</p>
                            )}
                            {aircraft.year_of_manufacture && (
                              <p><span className="font-medium">Year:</span> {aircraft.year_of_manufacture}</p>
                            )}
                          </div>

                          {aircraft.notes && (
                            <p className="text-sm text-gray-500 italic mt-2">{aircraft.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onOpenAircraftModal(aircraft)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteAircraft(aircraft.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
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
          )}

          {/* Inactive Aircraft */}
          {inactiveAircraft.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-500 text-white px-4 py-3">
                <h2 className="text-lg font-semibold">Inactive Aircraft</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {inactiveAircraft.map(aircraft => {
                  const typeInfo = getAircraftTypeInfo(aircraft.aircraft_type_id);
                  return (
                    <div key={aircraft.id} className="p-4 hover:bg-gray-50 transition opacity-75">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-700">{aircraft.registration}</h3>
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              Inactive
                            </span>
                          </div>

                          {typeInfo && (
                            <div className="mb-2">
                              <p className="text-lg text-gray-600 font-medium">
                                {typeInfo.type_code} - {typeInfo.type_name}
                              </p>
                              {typeInfo.engine_type && (
                                <p className="text-sm text-gray-500">
                                  Engine: {typeInfo.engine_type}
                                  {typeInfo.engine_variant && ` (${typeInfo.engine_variant})`}
                                </p>
                              )}
                            </div>
                          )}

                          {aircraft.notes && (
                            <p className="text-sm text-gray-500 italic mt-2">{aircraft.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onOpenAircraftModal(aircraft)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteAircraft(aircraft.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
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
          )}
        </div>
      )}
    </>
  );
}
