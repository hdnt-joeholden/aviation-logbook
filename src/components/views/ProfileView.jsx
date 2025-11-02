import React from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function ProfileView({
  profileFormData,
  setProfileFormData,
  onUpdateProfile,
  addresses,
  onOpenAddressModal,
  onDeleteAddress,
  employmentHistory,
  onOpenEmploymentModal,
  onDeleteEmployment,
  loading
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <select
                value={profileFormData.title || ''}
                onChange={(e) => setProfileFormData({...profileFormData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select...</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
                <option value="Rev">Rev</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forename(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileFormData.forename || ''}
                onChange={(e) => setProfileFormData({...profileFormData, forename: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileFormData.surname || ''}
                onChange={(e) => setProfileFormData({...profileFormData, surname: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Smith"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={profileFormData.date_of_birth || ''}
                onChange={(e) => setProfileFormData({...profileFormData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
              <select
                value={profileFormData.nationality && ['British', 'Irish', 'American', 'Canadian', 'Australian', 'New Zealand', 'French', 'German', 'Spanish', 'Italian', 'Dutch', 'Belgian', 'Swiss', 'Austrian', 'Polish', ''].includes(profileFormData.nationality) ? profileFormData.nationality : 'Other'}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setProfileFormData({...profileFormData, nationality: 'Other_Custom'});
                  } else {
                    setProfileFormData({...profileFormData, nationality: e.target.value});
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select...</option>
                <option value="British">British</option>
                <option value="Irish">Irish</option>
                <option value="American">American</option>
                <option value="Canadian">Canadian</option>
                <option value="Australian">Australian</option>
                <option value="New Zealand">New Zealand</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="Italian">Italian</option>
                <option value="Dutch">Dutch</option>
                <option value="Belgian">Belgian</option>
                <option value="Swiss">Swiss</option>
                <option value="Austrian">Austrian</option>
                <option value="Polish">Polish</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          {(profileFormData.nationality && !['British', 'Irish', 'American', 'Canadian', 'Australian', 'New Zealand', 'French', 'German', 'Spanish', 'Italian', 'Dutch', 'Belgian', 'Swiss', 'Austrian', 'Polish', ''].includes(profileFormData.nationality)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please specify your nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profileFormData.nationality === 'Other_Custom' ? '' : profileFormData.nationality}
                onChange={(e) => setProfileFormData({...profileFormData, nationality: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your nationality"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Licence Number <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={profileFormData.licence_number || ''}
              onChange={(e) => setProfileFormData({...profileFormData, licence_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="UK.123456.AME"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permanent Address <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(From current address in Address History)</span>
            </label>
            <textarea
              value={profileFormData.permanent_address || ''}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Add a current address in Address History below"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(From current address)</span>
              </label>
              <input
                type="text"
                value={profileFormData.postcode || ''}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="From address history"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={onUpdateProfile}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Address History</h2>
          <button
            onClick={() => onOpenAddressModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            <Plus size={18} />
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No addresses recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(address => (
              <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {address.is_current && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">
                        Current Address
                      </span>
                    )}
                    <p className="font-medium text-gray-800">{address.address_line_1}</p>
                    {address.address_line_2 && (
                      <p className="text-gray-600">{address.address_line_2}</p>
                    )}
                    <p className="text-gray-600">{address.city}{address.county && `, ${address.county}`}</p>
                    <p className="text-gray-600">{address.postcode}</p>
                    <p className="text-gray-600">{address.country}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      From: {new Date(address.from_date).toLocaleDateString('en-GB')}
                      {address.to_date && ` - To: ${new Date(address.to_date).toLocaleDateString('en-GB')}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onOpenAddressModal(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteAddress(address.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Employment History</h2>
          <button
            onClick={() => onOpenEmploymentModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            <Plus size={18} />
            Add Employment
          </button>
        </div>

        {employmentHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No employment history recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {employmentHistory.map(employment => (
              <div key={employment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {employment.is_current && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">
                        Current Position
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-800 text-lg">{employment.position}</h3>
                    <p className="text-gray-700 font-medium">{employment.company_name}</p>
                    {employment.company_approval_number && (
                      <p className="text-sm text-gray-600">Approval: {employment.company_approval_number}</p>
                    )}
                    {employment.duties && (
                      <p className="text-sm text-gray-600 mt-2">{employment.duties}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      From: {new Date(employment.from_date).toLocaleDateString('en-GB')}
                      {employment.to_date && ` - To: ${new Date(employment.to_date).toLocaleDateString('en-GB')}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onOpenEmploymentModal(employment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteEmployment(employment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
