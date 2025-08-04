import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import { propertyService } from '../services/propertyService';
import { dealService } from '../services/dealService';
import { adminService } from '../services/adminService';
import { toast } from 'react-hot-toast';
import { 
  CloudArrowDownIcon, 
  PlayIcon, 
  StopIcon, 
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [scrapingStatus, setScrapingStatus] = useState('idle');
  const [scrapingFilters, setScrapingFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    propertyType: ''
  });

  // Fetch stats
  const { data: propertyStats, isLoading: loadingPropertyStats } = useQuery(
    'propertyStats',
    propertyService.getPropertyStats
  );
  const { data: dealStats, isLoading: loadingDealStats } = useQuery(
    'dealStats',
    dealService.getDealStats
  );

  // Fetch scraping status
  const { data: scrapingData, isLoading: loadingScrapingStatus } = useQuery(
    'scrapingStatus',
    propertyService.getScrapingStatus,
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  // Manual scraping mutation
  const manualScrapingMutation = useMutation(
    () => propertyService.scrapeProperties(scrapingFilters),
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג הושלם בהצלחה! נמצאו ${data.scrapedCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בהפעלת סקרייפינג');
      }
    }
  );

  // City scraping mutation
  const cityScrapingMutation = useMutation(
    () => propertyService.scrapePropertiesByCity(scrapingFilters.city, scrapingFilters),
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג לעיר ${data.city} הושלם בהצלחה! נמצאו ${data.scrapedCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בסקרייפינג לפי עיר');
      }
    }
  );

  // Price range scraping mutation
  const priceRangeScrapingMutation = useMutation(
    () => propertyService.scrapePropertiesByPriceRange(scrapingFilters.minPrice, scrapingFilters.maxPrice, scrapingFilters),
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג לטווח מחירים הושלם בהצלחה! נמצאו ${data.scrapedCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בסקרייפינג לפי טווח מחירים');
      }
    }
  );

  // Room count scraping mutation
  const roomCountScrapingMutation = useMutation(
    () => propertyService.scrapePropertiesByRooms(scrapingFilters.minRooms, scrapingFilters.maxRooms, scrapingFilters),
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג למספר חדרים הושלם בהצלחה! נמצאו ${data.scrapedCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בסקרייפינג לפי מספר חדרים');
      }
    }
  );

  // Property type scraping mutation
  const propertyTypeScrapingMutation = useMutation(
    () => propertyService.scrapePropertiesByType(scrapingFilters.propertyType, scrapingFilters),
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג לסוג נכס ${data.propertyType} הושלם בהצלחה! נמצאו ${data.scrapedCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בסקרייפינג לפי סוג נכס');
      }
    }
  );

  // Start continuous scraping mutation
  const startContinuousScrapingMutation = useMutation(
    adminService.startContinuousScraping,
    {
      onSuccess: () => {
        toast.success('סקרייפינג רציף הופעל בהצלחה');
        setScrapingStatus('running');
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בהפעלת סקרייפינג רציף');
      }
    }
  );

  const handleManualScraping = () => {
    manualScrapingMutation.mutate();
  };

  const handleCityScraping = () => {
    if (!scrapingFilters.city) {
      toast.error('יש להזין עיר לסקרייפינג');
      return;
    }
    cityScrapingMutation.mutate();
  };

  const handlePriceRangeScraping = () => {
    if (!scrapingFilters.minPrice || !scrapingFilters.maxPrice) {
      toast.error('יש להזין טווח מחירים לסקרייפינג');
      return;
    }
    priceRangeScrapingMutation.mutate();
  };

  const handleRoomCountScraping = () => {
    if (!scrapingFilters.minRooms && !scrapingFilters.maxRooms) {
      toast.error('יש להזין מספר חדרים לסקרייפינג');
      return;
    }
    roomCountScrapingMutation.mutate();
  };

  const handlePropertyTypeScraping = () => {
    if (!scrapingFilters.propertyType) {
      toast.error('יש להזין סוג נכס לסקרייפינג');
      return;
    }
    propertyTypeScrapingMutation.mutate();
  };

  const handleStartContinuousScraping = () => {
    startContinuousScrapingMutation.mutate();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setScrapingFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loadingPropertyStats || loadingDealStats || loadingScrapingStatus) return <LoadingSpinner />;

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

      {/* Scraping Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ניהול סקרייפינג</h2>
        
        {/* Scraping Filters */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">פילטרים לסקרייפינג</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
              <input
                type="text"
                name="city"
                value={scrapingFilters.city}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="הכנס עיר"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר מינימלי</label>
              <input
                type="number"
                name="minPrice"
                value={scrapingFilters.minPrice}
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
                value={scrapingFilters.maxPrice}
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
                value={scrapingFilters.minRooms}
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
                value={scrapingFilters.maxRooms}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="מספר חדרים"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג נכס</label>
              <select
                name="propertyType"
                value={scrapingFilters.propertyType}
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
          </div>
        </div>

        {/* Scraping Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleManualScraping}
            disabled={manualScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
            {manualScrapingMutation.isLoading ? 'מחפש נכסים...' : 'סקרייפינג ידני'}
          </button>
          
          <button
            onClick={handleCityScraping}
            disabled={cityScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            {cityScrapingMutation.isLoading ? 'מחפש לפי עיר...' : 'סקרייפינג לפי עיר'}
          </button>

          <button
            onClick={handlePriceRangeScraping}
            disabled={priceRangeScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            {priceRangeScrapingMutation.isLoading ? 'מחפש לפי טווח מחירים...' : 'סקרייפינג לפי טווח מחירים'}
          </button>

          <button
            onClick={handleRoomCountScraping}
            disabled={roomCountScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            {roomCountScrapingMutation.isLoading ? 'מחפש לפי מספר חדרים...' : 'סקרייפינג לפי מספר חדרים'}
          </button>

          <button
            onClick={handlePropertyTypeScraping}
            disabled={propertyTypeScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            {propertyTypeScrapingMutation.isLoading ? 'מחפש לפי סוג נכס...' : 'סקרייפינג לפי סוג נכס'}
          </button>

          <button
            onClick={handleStartContinuousScraping}
            disabled={startContinuousScrapingMutation.isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            {startContinuousScrapingMutation.isLoading ? 'מתחיל...' : 'התחל סקרייפינג רציף'}
          </button>
        </div>

        {/* Scraping Status */}
        {scrapingData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">סטטוס סקרייפינג</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">סטטוס:</span>
                <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${
                  scrapingData.isScrapingRunning 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {scrapingData.isScrapingRunning ? 'פועל' : 'עוצר'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">נכסים אחרונים:</span>
                <span className="mr-2 font-medium">{scrapingData.recentProperties?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">עסקאות חמות:</span>
                <span className="mr-2 font-medium">{scrapingData.hotDealsCount || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Sources */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">נכסים לפי מקור</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Yad2</h3>
            <p className="text-sm text-gray-600 mb-2">נכסים מ-Yad2.co.il</p>
            <div className="text-lg font-bold text-blue-600">{scrapingData?.yad2Count || 0}</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">WinWin</h3>
            <p className="text-sm text-gray-600 mb-2">נכסים מ-WinWin.co.il</p>
            <div className="text-lg font-bold text-green-600">{scrapingData?.winwinCount || 0}</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Madlan</h3>
            <p className="text-sm text-gray-600 mb-2">נכסים מ-Madlan.co.il</p>
            <div className="text-lg font-bold text-purple-600">{scrapingData?.madlanCount || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;