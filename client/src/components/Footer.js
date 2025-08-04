import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">מערכת נדל"ן</h3>
            <p className="text-gray-300 text-sm">
              מערכת חכמה לאיתור עסקאות נדל"ן מתחת לשווי השוק
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  דשבורד
                </a>
              </li>
              <li>
                <a href="/properties" className="text-gray-300 hover:text-white transition-colors">
                  נכסים
                </a>
              </li>
              <li>
                <a href="/deals" className="text-gray-300 hover:text-white transition-colors">
                  עסקאות
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">צור קשר</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>אימייל: info@real-estate-system.com</p>
              <p>טלפון: 03-1234567</p>
              <p>כתובת: תל אביב, ישראל</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} מערכת נדל"ן. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 