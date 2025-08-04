import React from 'react';
import { useQuery } from 'react-query';
import { dealService } from '../services/dealService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const statusLabels = {
  interested: 'מתעניין',
  contacted: 'נוצר קשר',
  viewing_scheduled: 'נקבעה צפייה',
  offer_made: 'הוצעה הצעה',
  negotiating: 'במשא ומתן',
  closed: 'נסגרה',
  cancelled: 'בוטלה'
};

const Deals = () => {
  const { data, isLoading, error } = useQuery('myDeals', () => dealService.getMyDeals());

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600">שגיאה בטעינת עסקאות</div>;

  const deals = data?.deals || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">העסקאות שלי</h1>
        <p className="text-gray-600">רשימת כל העסקאות שלך במערכת</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">עסקאות ({deals.length})</h2>
        </div>
        <div className="p-6">
          {deals.length > 0 ? (
            <div className="space-y-4">
              {deals.map((deal) => (
                <Link
                  to={`/deals/${deal._id}`}
                  key={deal._id}
                  className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{deal.propertyId?.address}</span>
                      <span className="text-sm text-gray-500">{deal.propertyId?.city}, {deal.propertyId?.neighborhood}</span>
                    </div>
                    <div className="flex items-center">
                      {deal.status === 'closed' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 ml-1" />
                      ) : deal.status === 'cancelled' ? (
                        <XCircleIcon className="h-5 w-5 text-red-600 ml-1" />
                      ) : null}
                      <span className="text-sm font-medium text-gray-700">{statusLabels[deal.status]}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>מחיר: ₪{deal.originalPrice?.toLocaleString()}</span>
                    <span>עמלה: {deal.commissionPercentage}%</span>
                    <span>נוצר בתאריך: {new Date(deal.createdAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">לא נמצאו עסקאות</p>
              <p className="text-gray-400 text-sm mt-2">טרם פתחת עסקה במערכת</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deals;