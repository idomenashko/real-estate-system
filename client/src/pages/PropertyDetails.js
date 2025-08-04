import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { propertyService } from '../services/propertyService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPinIcon, 
  HomeIcon, 
  CurrencyDollarIcon,
  FireIcon,
  PhoneIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  StarIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const { data: property, isLoading, error } = useQuery(
    ['property', propertyId],
    () => propertyService.getPropertyById(propertyId),
    {
      enabled: !!propertyId,
    }
  );

  const { data: analysis } = useQuery(
    ['propertyAnalysis', propertyId],
    () => propertyService.getPropertyAnalysis(propertyId),
    {
      enabled: !!propertyId,
    }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">נכס לא נמצא</h2>
          <p className="text-gray-600 mb-6">הנכס שחיפשת לא נמצא במערכת</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  const handleExternalLink = (url) => {
    window.open(url, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL').format(price);
  };

  const getPropertyTypeText = (type) => {
    const types = {
      'apartment': 'דירה',
      'house': 'בית פרטי',
      'penthouse': 'נטהאוס',
      'garden_apartment': 'דירת גן',
      'duplex': 'דופלקס'
    };
    return types[type] || type;
  };

  const getConditionText = (condition) => {
    const conditions = {
      'excellent': 'מצוין',
      'good': 'טוב',
      'fair': 'סביר',
      'needs_renovation': 'דרוש שיפוץ',
      'new': 'חדש'
    };
    return conditions[condition] || condition;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          חזור
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.address}
            </h1>
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {property.city}, {property.neighborhood}
            </div>
          </div>
          
          {property.isHotDeal && (
            <div className="flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full">
              <FireIcon className="h-5 w-5 mr-2" />
              עסקה חמה
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Info */}
        <div className="lg:col-span-2">
          {/* Property Image Placeholder */}
          <div className="bg-gray-200 rounded-lg h-64 mb-6 flex items-center justify-center">
            <div className="text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">תמונת הנכס</p>
              <p className="text-sm text-gray-400">תמונות יוצגו כאן בעתיד</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                פרטי הנכס
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ניתוח שוק
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                פרטי קשר
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">מידע בסיסי</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">סוג נכס:</span>
                      <span className="font-medium">{getPropertyTypeText(property.propertyType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">חדרים:</span>
                      <span className="font-medium">{property.rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">גודל:</span>
                      <span className="font-medium">{property.size} מ"ר</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">קומה:</span>
                      <span className="font-medium">{property.floor}/{property.totalFloors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">מצב:</span>
                      <span className="font-medium">{getConditionText(property.condition)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">מחיר ופרטים</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">מחיר:</span>
                      <span className="font-bold text-green-600 text-lg">₪{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">מחיר למ"ר:</span>
                      <span className="font-medium">₪{formatPrice(Math.round(property.price / property.size))}</span>
                    </div>
                    {property.hotDealScore && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ציון עסקה:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{property.hotDealScore}/100</span>
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">שירותים ותכונות</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${property.parking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">חניה</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${property.elevator ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">מעלית</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${property.balcony ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">מרפסת</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${property.garden ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">גינה</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">תיאור</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && analysis && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ניתוח שוק</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">מחיר ממוצע באזור</p>
                    <p className="text-2xl font-bold text-gray-900">₪{formatPrice(analysis.analysis.averagePriceInArea)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">השוואה למחיר</p>
                    <p className={`text-2xl font-bold ${analysis.analysis.priceComparison < 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.analysis.priceComparison}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">חיסכון פוטנציאלי</p>
                    <p className="text-2xl font-bold text-green-600">₪{formatPrice(analysis.analysis.potentialSavings)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">האם עסקה טובה?</p>
                    <p className={`text-2xl font-bold ${analysis.analysis.isGoodDeal ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.analysis.isGoodDeal ? 'כן' : 'לא'}
                    </p>
                  </div>
                </div>
              </div>

              {analysis.analysis.similarProperties.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">נכסים דומים באזור</h3>
                  <div className="space-y-3">
                    {analysis.analysis.similarProperties.slice(0, 5).map((similarProperty) => (
                      <div key={similarProperty._id} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{similarProperty.address}</p>
                            <p className="text-sm text-gray-600">{similarProperty.rooms} חדרים, {similarProperty.size} מ"ר</p>
                          </div>
                          <p className="font-bold text-green-600">₪{formatPrice(similarProperty.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי קשר</h3>
                <div className="space-y-4">
                  {property.contactName && (
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium">{property.contactName}</span>
                    </div>
                  )}
                  {property.contactPhone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a href={`tel:${property.contactPhone}`} className="text-blue-600 hover:text-blue-800">
                        {property.contactPhone}
                      </a>
                    </div>
                  )}
                  {property.sourceUrl && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <button
                        onClick={() => handleExternalLink(property.sourceUrl)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        צפה באתר המקור
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">מידע נוסף</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">מקור:</span>
                    <span className="font-medium">{property.sourceWebsite}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">תאריך הוספה:</span>
                    <span className="font-medium">{new Date(property.createdAt).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">עודכן לאחרונה:</span>
                    <span className="font-medium">{new Date(property.updatedAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Price and Actions */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₪{formatPrice(property.price)}
              </div>
              <div className="text-sm text-gray-600">
                ₪{formatPrice(Math.round(property.price / property.size))} למ"ר
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full btn-primary">
                <PhoneIcon className="h-5 w-5 mr-2" />
                התקשר עכשיו
              </button>
              <button className="w-full btn-secondary">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                צפה באתר המקור
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות מהירות</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">חדרים:</span>
                <span className="font-medium">{property.rooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">גודל:</span>
                <span className="font-medium">{property.size} מ"ר</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">קומה:</span>
                <span className="font-medium">{property.floor}/{property.totalFloors}</span>
              </div>
              {property.hotDealScore && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ציון עסקה:</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">{property.hotDealScore}</span>
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;