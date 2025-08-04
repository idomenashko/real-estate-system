import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePreferences, changePassword } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('הפרופיל עודכן בהצלחה');
    } catch {
      toast.error('שגיאה בעדכון פרופיל');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePreferences(preferences);
      toast.success('העדפות עודכנו בהצלחה');
    } catch {
      toast.error('שגיאה בעדכון העדפות');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('יש למלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('הסיסמה שונתה בהצלחה');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast.error('שגיאה בשינוי סיסמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">הפרופיל שלי</h1>
        <p className="text-gray-600">עדכן את הפרטים האישיים והעדפותיך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">פרטים אישיים</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            עדכן פרופיל
          </button>
        </form>

        {/* Preferences */}
        <form onSubmit={handlePreferencesSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">העדפות חיפוש</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ערים מועדפות (מופרד בפסיקים)</label>
            <input
              type="text"
              name="cities"
              value={preferences.cities || ''}
              onChange={handlePreferencesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="תל אביב, רמת גן, חיפה..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">שכונות מועדפות (מופרד בפסיקים)</label>
            <input
              type="text"
              name="neighborhoods"
              value={preferences.neighborhoods || ''}
              onChange={handlePreferencesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="מרכז, נווה צדק..."
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מינימלי</label>
              <input
                type="number"
                name="minPrice"
                value={preferences.minPrice || ''}
                onChange={handlePreferencesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="₪"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מקסימלי</label>
              <input
                type="number"
                name="maxPrice"
                value={preferences.maxPrice || ''}
                onChange={handlePreferencesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="₪"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            עדכן העדפות
          </button>
        </form>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-lg shadow p-6 mt-8 max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">שינוי סיסמה</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה נוכחית</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה חדשה</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          שנה סיסמה
        </button>
      </form>
    </div>
  );
};

export default Profile;