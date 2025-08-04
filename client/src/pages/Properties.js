import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MagnifyingGlassIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Properties = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    city: '',
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    propertyType: '',
    isHotDeal: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get available cities for dropdown
  const { data: citiesData } = useQuery(
    ['cities'],
    () => propertyService.getAvailableCities(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Get properties with dynamic search
  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['properties', filters, searchQuery],
    () => propertyService.searchPropertiesDynamic({ ...filters, search: searchQuery }),
    { 
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false
    }
  );

  // Get scraping status
  const { data: scrapingStatus } = useQuery(
    'scrapingStatus',
    propertyService.getScrapingStatus,
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  // Update available cities when data is loaded
  useEffect(() => {
    if (citiesData?.cities) {
      setAvailableCities(citiesData.cities);
    }
  }, [citiesData]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await propertyService.autoScrapeProperties({ ...filters, search: searchQuery });
      refetch();
    } catch (error) {
      console.error('Error refreshing properties:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      neighborhood: '',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      propertyType: '',
      isHotDeal: false
    });
    setSearchQuery('');
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const formatPrice = (price) => {
    if (!price) return 'לא צוין';
    return `₪${price.toLocaleString()}`;
  };

  const formatPricePerSqm = (price, size) => {
    if (!price || !size) return '';
    const pricePerSqm = Math.round(price / size);
    return `₪${pricePerSqm.toLocaleString()}/מ"ר`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">נכסים</h1>
        <p className="text-gray-600">חפשו וסננו נכסים לפי העדפותיכם</p>
        
        {/* Refresh message */}
        {propertiesData?.message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">{propertiesData.message}</p>
          </div>
        )}
        
        {/* Scraping status */}
        {scrapingStatus?.isScrapingRunning && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm flex items-center">
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              סקרייפינג פעיל - מחפש נכסים חדשים...
            </p>
          </div>
        )}
        
        {/* New properties notification */}
        {propertiesData?.totalProperties > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              נמצאו {propertiesData.totalProperties} נכסים מתאימים לחיפוש שלך
            </p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש נכסים לפי כתובת, עיר או שכונה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                חפש
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">כל הערים</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שכונה</label>
              <input
                type="text"
                name="neighborhood"
                value={filters.neighborhood}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס שכונה"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מינימלי</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="₪"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מקסימלי</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="₪"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חדרים מינימלי</label>
              <input
                type="number"
                name="minRooms"
                value={filters.minRooms}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="מספר חדרים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חדרים מקסימלי</label>
              <input
                type="number"
                name="maxRooms"
                value={filters.maxRooms}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="מספר חדרים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label>
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">כל הסוגים</option>
                <option value="apartment">דירה</option>
                <option value="house">בית פרטי</option>
                <option value="penthouse">נטהאוס</option>
                <option value="garden_apartment">דירת גן</option>
                <option value="duplex">דופלקס</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isHotDeal"
                checked={filters.isHotDeal}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="mr-2 text-sm font-medium text-gray-700">עסקאות חמות בלבד</label>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              נקה סינון
            </button>
            <button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="mr-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'מחפש נכסים...' : 'רענן נכסים'}
            </button>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            נכסים ({propertiesData?.totalProperties || 0})
          </h2>
        </div>
        <div className="p-6">
          {propertiesData?.properties && propertiesData.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesData.properties.map((property) => (
                <div key={property._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePropertyClick(property._id)}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{property.address}</h3>
                      {property.isHotDeal && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FireIcon className="w-3 h-3 mr-1" />
                          עסקה חמה
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{property.city}, {property.neighborhood}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      <span>{property.rooms} חדרים</span>
                      <span className="mx-2">•</span>
                      <span>{property.size} מ"ר</span>
                      {property.floor && (
                        <>
                          <span className="mx-2">•</span>
                          <span>קומה {property.floor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(property.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPricePerSqm(property.price, property.size)}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      צפה בפרטים
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">לא נמצאו נכסים</p>
              <p className="text-gray-400 text-sm mt-2">נסו לשנות את הסינון או החיפוש</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties; 