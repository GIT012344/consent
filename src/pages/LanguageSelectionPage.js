import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

const LanguageSelectionPage = () => {
  const navigate = useNavigate();

  const handleLanguageSelect = (lang) => {
    // Navigate to consent flow page for customer with selected language
    // customer type จะไปที่ /consent/customer พร้อมกับภาษาที่เลือก
    navigate(`/consent/customer?lang=${lang}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Globe className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            เลือกภาษา / Choose Language
          </h1>
          <p className="text-gray-600">
            กรุณาเลือกภาษาที่ต้องการ / Please select your preferred language
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLanguageSelect('th')}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="text-xl mb-1">🇹🇭 ภาษาไทย</div>
            <div className="text-sm opacity-90">Thai Language</div>
          </button>

          <button
            onClick={() => handleLanguageSelect('en')}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="text-xl mb-1">🇬🇧 English</div>
            <div className="text-sm opacity-90">ภาษาอังกฤษ</div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Consent Management System v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionPage;
