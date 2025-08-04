import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { propertyService } from '../services/propertyService';
import { dealService } from '../services/dealService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FireIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  // Fetch property data
  const { data, isLoading, error } = useQuery(
    ['property', propertyId],
    () => propertyService.getProperty(propertyId)
  );

  // Fetch property analysis
  const { data: analysisData, isLoading: loadingAnalysis } = useQuery(
    ['propertyAnalysis', propertyId],
    () => propertyService.getPropertyAnalysis(propertyId)
  );

  if (isLoading || loadingAnalysis) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600">שגיאה בטעינת נכס</div>;
  if (!data) return <div className="text-center text-gray-500">לא נמצא נכס</div>;

  const property = data;
  const analysis = analysisData?.analysis;

  // Handle create deal
  const handleCreateDeal = async () => {
    try {
      await dealService.createDeal({
        propertyId: property._id,
        originalPrice: property.price,
        commissionPercentage: undefined,
        contactName: property.contactName,
        contactPhone: property.contactPhone,
        contactEmail: property.contactEmail
      });
      toast.success('עסקה נוצרה בהצלחה!');
      navigate('/deals');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'שגיאה ביצירת עסקה');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.address}</h1>
            <p className="text-gray-600">{property.city}, {property.neighborhood}</p>
            <div className="flex items-center mt-2 space-x-4 space-x-reverse">
              <span className="text-sm text-gray-500">{property.rooms} חדרים</span>
              <span className="text-sm text-gray-500">{property.size} מ"ר</span>
              <span className="text-sm text-gray-500">{property.propertyType}</span>
              {property.isHotDeal && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <FireIcon className="h-3 w-3 ml-1" /> עסקה חמה
                </span>
              )}
            </div>
          </div>
          <div className="text-left mt-4 md:mt-0">
            <p className="text-2xl font-bold text-gray-900">₪{property.price?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">₪{property.pricePerSquareMeter?.toLocaleString()}/מ"ר</p>
            <button
              onClick={handleCreateDeal}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              פתח עסקה על נכס זה
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">פרטי הנכס</h2>
            <ul className="text-gray-700 space-y-1">
              <li>קומה: {property.floor ?? '---'} מתוך {property.totalFloors ?? '---'}</li>
              <li>מצב הנכס: {property.condition}</li>
              <li>פינוי בינוי: {property.evictionBuilding ? 'כן' : 'לא'}</li>
              <li>חניה: {property.parking ? 'כן' : 'לא'}</li>
              <li>מעלית: {property.elevator ? 'כן' : 'לא'}</li>
              <li>מרפסת: {property.balcony ? 'כן' : 'לא'}</li>
              <li>גינה: {property.garden ? 'כן' : 'לא'}</li>
              <li>מקור: {property.sourceWebsite}</li>
              <li>תאריך הוספה: {new Date(property.createdAt).toLocaleDateString('he-IL')}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">איש קשר</h2>
            <ul className="text-gray-700 space-y-1">
              <li>שם: {property.contactName || '---'}</li>
              <li>טלפון: {property.contactPhone || '---'}</li>
              <li>אימייל: {property.contactEmail || '---'}</li>
              <li>
                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  מעבר למודעה באתר המקורי
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Market Analysis */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ניתוח שוק</h2>
        {analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 mb-2">מחיר ממוצע באזור: <span className="font-bold">₪{analysis.averagePriceInArea?.toLocaleString()}</span></p>
              <p className="text-gray-700 mb-2">מחיר הנכס ביחס לממוצע: <span className="font-bold">{analysis.priceComparison}%</span></p>
              <p className="text-gray-700 mb-2">פוטנציאל חיסכון: <span className="font-bold">₪{analysis.potentialSavings?.toLocaleString()}</span></p>
              <p className="text-gray-700 mb-2">האם עסקה טובה? <span className={`font-bold ${analysis.isGoodDeal ? 'text-green-600' : 'text-red-600'}`}>{analysis.isGoodDeal ? 'כן' : 'לא'}</span></p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">נכסים דומים שנמכרו</h3>
              {analysis.similarProperties && analysis.similarProperties.length > 0 ? (
                <ul className="text-gray-700 space-y-1">
                  {analysis.similarProperties.map((sp, idx) => (
                    <li key={idx}>
                      {sp.address} - ₪{sp.price?.toLocaleString()} ({new Date(sp.soldDate).toLocaleDateString('he-IL')})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">אין נתונים על נכסים דומים</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">אין נתוני ניתוח שוק זמינים</p>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;