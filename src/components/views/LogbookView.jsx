import React from 'react';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';

export default function LogbookView({
  entries,
  onOpenEntryModal,
  onDeleteEntry,
  onExportPDF,
  supervisors,
  userAircraft,
  aircraftTypes,
  ataChapters
}) {
  const getAircraftInfo = (aircraftId) => {
    const aircraft = userAircraft.find(a => a.id === aircraftId);
    if (!aircraft) return { registration: 'Unknown', typeCode: 'N/A' };

    const typeInfo = aircraftTypes.find(t => t.id === aircraft.aircraft_type_id);
    return {
      registration: aircraft.registration,
      typeCode: typeInfo?.type_code || 'Unknown',
      typeName: typeInfo?.type_name || '',
      engine: typeInfo?.engine_type || ''
    };
  };

  const entriesByAircraft = entries.reduce((acc, entry) => {
    const aircraftInfo = getAircraftInfo(entry.aircraft_id);
    const key = aircraftInfo.registration;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const getSupervisorDisplay = (supervisorId) => {
    const supervisor = supervisors.find(s => s.id === supervisorId);
    if (!supervisor) return 'No supervisor assigned';
    return `${supervisor.approval_number} – ${supervisor.name} – ${supervisor.company}`;
  };

  const getAtaDisplay = (ataCode) => {
    const ata = ataChapters.find(a => a.chapter_code === ataCode);
    return ata ? `${ata.chapter_code} - ${ata.chapter_name}` : ataCode;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onOpenEntryModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New Entry
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Total Entries: <span className="font-semibold">{entries.length}</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Plus size={64} className="mx-auto mb-2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No entries yet</h3>
          <p className="text-gray-600 mb-6">Start building your professional logbook</p>
          <button
            onClick={() => onOpenEntryModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Create Your First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(entriesByAircraft).sort().map(registration => {
            const firstEntry = entriesByAircraft[registration][0];
            const aircraftInfo = getAircraftInfo(firstEntry.aircraft_id);

            return (
              <div key={registration} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3">
                  <h2 className="text-lg font-semibold">
                    {registration}
                    {aircraftInfo.typeCode !== 'Unknown' && (
                      <span className="ml-2 text-sm font-normal opacity-90">
                        {aircraftInfo.typeCode} - {aircraftInfo.typeName}
                      </span>
                    )}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {entriesByAircraft[registration]
                  .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
                  .map(entry => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              {new Date(entry.entry_date).toLocaleDateString('en-GB')}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Job: {entry.job_number}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {getAtaDisplay(entry.ata_chapter)}
                            </span>
                          </div>
                          <p className="text-gray-800 font-medium mb-1">{entry.task_description}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Supervisor: {getSupervisorDisplay(entry.supervisor_id)}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 italic">Notes: {entry.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onOpenEntryModal(entry)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
