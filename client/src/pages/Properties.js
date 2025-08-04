import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { propertyService } from '../services/propertyService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Properties = () => {
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

  const { data: propertiesData, isLoading } = useQuery(
    ['properties', filters],
    () => propertyService.getProperties(filters)
  );

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
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
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">נכסים</h1>
        <p className="text-gray-600">חפשו וסננו נכסים לפי העדפותיכם</p>
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
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס עיר"
              />
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
                <div key={property._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{property.address}</h3>
                    <p className="text-sm text-gray-600">{property.city}, {property.neighborhood}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">
                      <span>{property.rooms} חדרים</span>
                      <span className="mx-2">•</span>
                      <span>{property.size} מ"ר</span>
                    </div>
                    {property.isHotDeal && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        עסקה חמה
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ₪{property.price?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₪{property.pricePerSquareMeter?.toLocaleString()}/מ"ר
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