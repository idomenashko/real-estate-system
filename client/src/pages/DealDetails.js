import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { dealService } from '../services/dealService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: 'interested', label: 'מתעניין' },
  { value: 'contacted', label: 'נוצר קשר' },
  { value: 'viewing_scheduled', label: 'נקבעה צפייה' },
  { value: 'offer_made', label: 'הוצעה הצעה' },
  { value: 'negotiating', label: 'במשא ומתן' },
  { value: 'closed', label: 'נסגרה' },
  { value: 'cancelled', label: 'בוטלה' }
];

const DealDetails = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(['deal', dealId], () => dealService.getDeal(dealId));
  const deal = data;

  const [note, setNote] = useState('');
  const [status, setStatus] = useState(deal?.status || '');

  // Update status mutation
  const updateStatusMutation = useMutation(
    (newStatus) => dealService.updateDealStatus(dealId, newStatus),
    {
      onSuccess: () => {
        toast.success('סטטוס עודכן בהצלחה');
        queryClient.invalidateQueries(['deal', dealId]);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error?.message || 'שגיאה בעדכון סטטוס');
      }
    }
  );

  // Add note mutation
  const addNoteMutation = useMutation(
    (content) => dealService.addDealNote(dealId, content),
    {
      onSuccess: () => {
        toast.success('הערה נוספה');
        setNote('');
        queryClient.invalidateQueries(['deal', dealId]);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error?.message || 'שגיאה בהוספת הערה');
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600">שגיאה בטעינת עסקה</div>;
  if (!deal) return <div className="text-center text-gray-500">לא נמצאה עסקה</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">עסקה עבור {deal.propertyId?.address}</h1>
        <p className="text-gray-600 mb-4">{deal.propertyId?.city}, {deal.propertyId?.neighborhood}</p>
        <div className="flex flex-wrap gap-4 mb-4">
          <span className="text-sm text-gray-500">מחיר: ₪{deal.originalPrice?.toLocaleString()}</span>
          <span className="text-sm text-gray-500">עמלה: {deal.commissionPercentage}%</span>
          <span className="text-sm text-gray-500">סטטוס: {statusOptions.find(s => s.value === deal.status)?.label}</span>
          <span className="text-sm text-gray-500">נוצר בתאריך: {new Date(deal.createdAt).toLocaleDateString('he-IL')}</span>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">עדכן סטטוס עסקה</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={() => updateStatusMutation.mutate(status)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={updateStatusMutation.isLoading}
          >
            עדכן סטטוס
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">הוסף הערה לעסקה</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="כתוב הערה..."
          />
          <button
            onClick={() => addNoteMutation.mutate(note)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={addNoteMutation.isLoading || !note.trim()}
          >
            הוסף הערה
          </button>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">הערות</h2>
          {deal.notes && deal.notes.length > 0 ? (
            <ul className="text-gray-700 space-y-1">
              {deal.notes.map((n, idx) => (
                <li key={idx} className="border-b border-gray-100 pb-2 mb-2">
                  <span className="font-medium">{n.content}</span>
                  <span className="text-xs text-gray-400 ml-2">({new Date(n.createdAt).toLocaleString('he-IL')})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">אין הערות לעסקה זו</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetails;