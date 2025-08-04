import React from 'react';
import { useQuery } from 'react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import { propertyService } from '../services/propertyService';
import { dealService } from '../services/dealService';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  // Fetch stats
  const { data: propertyStats, isLoading: loadingPropertyStats } = useQuery(
    'propertyStats',
    propertyService.getPropertyStats
  );
  const { data: dealStats, isLoading: loadingDealStats } = useQuery(
    'dealStats',
    dealService.getDealStats
  );

  if (loadingPropertyStats || loadingDealStats) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">פאנל ניהול</h1>
        <p className="text-gray-600">סטטיסטיקות מערכת ופעולות ניהול</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">סה"כ נכסים</div>
          <div className="text-2xl font-bold text-gray-900">{propertyStats?.totalProperties || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">עסקאות חמות</div>
          <div className="text-2xl font-bold text-gray-900">{propertyStats?.hotDealsCount || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">עסקאות פעילות</div>
          <div className="text-2xl font-bold text-gray-900">{dealStats?.activeDeals || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">עמלות מצטברות</div>
          <div className="text-2xl font-bold text-gray-900">₪{dealStats?.totalCommission?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">פעולות ניהול</h2>
        <button
          onClick={() => toast.success('עדכון נכסים הופעל (דמו)')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          הפעל עדכון נכסים ידני
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;