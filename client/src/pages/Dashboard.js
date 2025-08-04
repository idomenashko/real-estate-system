import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { dealService } from '../services/dealService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  FireIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: propertyStats, isLoading: loadingStats } = useQuery(
    'propertyStats',
    propertyService.getPropertyStats
  );

  // Fetch personalized hot deals based on user preferences
  const { data: personalizedHotDeals, isLoading: loadingPersonalizedHotDeals } = useQuery(
    'personalizedHotDeals',
    () => propertyService.getPersonalizedHotDeals(5),
    {
      enabled: !!user, // Only fetch if user is logged in
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch personalized properties
  const { data: personalizedProperties, isLoading: loadingPersonalizedProperties } = useQuery(
    'personalizedProperties',
    () => propertyService.getPersonalizedProperties({ includeHotDeals: true, limit: 8 }),
    {
      enabled: !!user, // Only fetch if user is logged in
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: dealStats, isLoading: loadingDealStats } = useQuery(
    'dealStats',
    dealService.getDealStats
  );

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  if (loadingStats || loadingPersonalizedHotDeals || loadingPersonalizedProperties || loadingDealStats) {
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
                ₪{dealStats?.totalCommissions?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Hot Deals Section */}
      {user && personalizedHotDeals && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-red-500" />
              עסקאות חמות מותאמות אישית
            </h2>
            <span className="text-sm text-gray-500">
              נמצאו {personalizedHotDeals.totalPersonalizedHotDeals || 0} נכסים מתאימים
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedHotDeals.personalizedHotDeals?.slice(0, 6).map((property) => (
              <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePropertyClick(property._id)}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {property.address}
                    </h3>
                    {property.isHotDeal && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FireIcon className="h-4 w-4 mr-1" />
                        חם
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {property.city}, {property.neighborhood}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">חדרים</p>
                      <p className="font-semibold">{property.rooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">גודל</p>
                      <p className="font-semibold">{property.size} מ"ר</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">קומה</p>
                      <p className="font-semibold">{property.floor}/{property.totalFloors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">מחיר</p>
                      <p className="font-semibold text-green-600">₪{property.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      ציון: {property.hotDealScore}/100
                    </div>
                    <button className="btn-primary text-sm">
                      פרטים נוספים
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Properties Section */}
      {user && personalizedProperties && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-blue-500" />
              נכסים מותאמים אישית
            </h2>
            <span className="text-sm text-gray-500">
              {personalizedProperties.totalPersonalizedProperties || 0} נכסים מתאימים להעדפות שלך
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalizedProperties.personalizedProperties?.slice(0, 8).map((property) => (
              <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePropertyClick(property._id)}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {property.address}
                    </h3>
                    {property.isHotDeal && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FireIcon className="h-3 w-3 mr-1" />
                        חם
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    {property.city}, {property.neighborhood}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">חדרים</p>
                      <p className="text-sm font-semibold">{property.rooms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">מחיר</p>
                      <p className="text-sm font-semibold text-green-600">₪{property.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <button className="w-full btn-primary text-xs">
                    צפה בפרטים
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Preferences Summary */}
      {user && user.preferences && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">העדפות החיפוש שלך</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">טווח מחירים</p>
              <p className="text-sm text-gray-900">
                ₪{user.preferences.priceRange?.min?.toLocaleString()} - ₪{user.preferences.priceRange?.max?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">חדרים</p>
              <p className="text-sm text-gray-900">
                {user.preferences.minRooms} - {user.preferences.maxRooms}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ערים</p>
              <p className="text-sm text-gray-900">
                {user.preferences.cities?.length > 0 ? user.preferences.cities.join(', ') : 'כל הערים'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 