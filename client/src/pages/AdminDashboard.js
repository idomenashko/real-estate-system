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
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [scrapingStatus, setScrapingStatus] = useState('idle');

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
    adminService.getScrapingStatus,
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  // Manual scraping mutation
  const manualScrapingMutation = useMutation(
    adminService.triggerManualScraping,
    {
      onSuccess: (data) => {
        toast.success(`סקרייפינג הופעל בהצלחה! נמצאו ${data.newPropertiesCount} נכסים חדשים`);
        queryClient.invalidateQueries(['properties', 'propertyStats']);
      },
      onError: (error) => {
        toast.error(error.message || 'שגיאה בהפעלת סקרייפינג');
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

  const handleStartContinuousScraping = () => {
    startContinuousScrapingMutation.mutate();
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

      {/* Scraping Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
          סטטוס סקרייפינג
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">נכסים מ-Yad2</div>
            <div className="text-lg font-semibold text-gray-900">{scrapingData?.yad2Count || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">נכסים מ-WinWin</div>
            <div className="text-lg font-semibold text-gray-900">{scrapingData?.winwinCount || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">נכסים מ-Madlan</div>
            <div className="text-lg font-semibold text-gray-900">{scrapingData?.madlanCount || 0}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              scrapingData?.isRunning ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {scrapingData?.isRunning ? 'סקרייפינג פעיל' : 'סקרייפינג לא פעיל'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            עדכון אחרון: {scrapingData?.lastUpdate ? new Date(scrapingData.lastUpdate).toLocaleString('he-IL') : 'לא ידוע'}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">פעולות ניהול</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleManualScraping}
            disabled={manualScrapingMutation.isLoading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
            {manualScrapingMutation.isLoading ? 'מחפש נכסים...' : 'סקרייפינג ידני'}
          </button>
          
          <button
            onClick={handleStartContinuousScraping}
            disabled={startContinuousScrapingMutation.isLoading || scrapingData?.isRunning}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            {startContinuousScrapingMutation.isLoading ? 'מפעיל...' : 'הפעל סקרייפינג רציף'}
          </button>
        </div>
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