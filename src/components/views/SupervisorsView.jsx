import React from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

export default function SupervisorsView({
  supervisors,
  onOpenSupervisorModal,
  onDeleteSupervisor
}) {
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onOpenSupervisorModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Supervisor
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Total Supervisors: <span className="font-semibold">{supervisors.length}</span>
        </div>
      </div>

      {supervisors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users size={64} className="mx-auto mb-2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No supervisors yet</h3>
          <p className="text-gray-600 mb-6">Add supervisors to assign them to your logbook entries</p>
          <button
            onClick={() => onOpenSupervisorModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Add Your First Supervisor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {supervisors.map(supervisor => (
              <div key={supervisor.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{supervisor.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Approval No:</span> {supervisor.approval_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span> {supervisor.company}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onOpenSupervisorModal(supervisor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteSupervisor(supervisor.id)}
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
      )}
    </>
  );
}
