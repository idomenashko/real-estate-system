import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { dealService } from '../services/dealService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  FireIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: propertyStats, isLoading: loadingStats } = useQuery(
    'propertyStats',
    propertyService.getPropertyStats
  );

  const { data: hotDeals, isLoading: loadingHotDeals } = useQuery(
    'hotDeals',
    () => propertyService.getHotDeals(5)
  );

  const { data: dealStats, isLoading: loadingDealStats } = useQuery(
    'dealStats',
    dealService.getDealStats
  );

  if (loadingStats || loadingHotDeals || loadingDealStats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          שלום, {user?.name}!
        </h1>
        <p className="text-gray-600">
          ברוכים הבאים לדשבורד מערכת הנדל"ן שלכם
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <BuildingOfficeIcon className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">סה"כ נכסים</p>
              <p className="text-2xl font-bold text-gray-900">
                {propertyStats?.totalProperties || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FireIcon className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">עסקאות חמות</p>
              <p className="text-2xl font-bold text-gray-900">
                {propertyStats?.hotDealsCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">עסקאות פעילות</p>
              <p className="text-2xl font-bold text-gray-900">
                {dealStats?.activeDeals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">עמלות מצטברות</p>
              <p className="text-2xl font-bold text-gray-900">
                ₪{dealStats?.totalCommission?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hot Deals Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">עסקאות חמות</h2>
        </div>
        <div className="p-6">
          {hotDeals && hotDeals.length > 0 ? (
            <div className="space-y-4">
              {hotDeals.map((property) => (
                <div key={property._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.address}</h3>
                      <p className="text-sm text-gray-600">{property.city}, {property.neighborhood}</p>
                      <div className="flex items-center mt-2 space-x-4 space-x-reverse">
                        <span className="text-sm text-gray-500">{property.rooms} חדרים</span>
                        <span className="text-sm text-gray-500">{property.size} מ"ר</span>
                        {property.isHotDeal && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FireIcon className="h-3 w-3 ml-1" />
                            עסקה חמה
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-gray-900">
                        ₪{property.price?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₪{property.pricePerSquareMeter?.toLocaleString()}/מ"ר
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">אין עסקאות חמות כרגע</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">נכסים אחרונים</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">אין נכסים אחרונים להצגה</p>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">עסקאות אחרונות</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">אין עסקאות אחרונות להצגה</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 