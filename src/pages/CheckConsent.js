import React, { useState } from 'react';
import { Search, FileText, Calendar, User } from 'lucide-react';
import { consentAPI } from '../services/api';

const CheckConsent = () => {
  const [searchValue, setSearchValue] = useState('');
  const [consentData, setConsentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const language = localStorage.getItem('language') || 'th';

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError(language === 'th' ? 'กรุณากรอกเลขบัตรประชาชน/พาสปอร์ต' : 'Please enter ID/Passport number');
      return;
    }

    setLoading(true);
    setError('');
    setConsentData(null);

    try {
      const response = await consentAPI.checkConsent(searchValue);
      if (response.success) {
        setConsentData(response.data);
      } else {
        setError(response.message || (language === 'th' ? 'ไม่พบข้อมูล' : 'No data found'));
      }
    } catch (err) {
      setError(language === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                {language === 'th' ? 'ตรวจสอบข้อมูลความยินยอม' : 'Check Consent Data'}
              </h1>
              <p className="text-gray-600 mt-2">
                {language === 'th' ? 'กรอกเลขบัตรประชาชนหรือพาสปอร์ตเพื่อตรวจสอบ' : 'Enter ID or passport number to check'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={language === 'th' ? 'เลขบัตรประชาชน/พาสปอร์ต' : 'ID/Passport number'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {language === 'th' ? 'กำลังค้นหา...' : 'Searching...'}
                    </span>
                  ) : (
                    language === 'th' ? 'ค้นหา' : 'Search'
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {consentData && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {language === 'th' ? 'พบข้อมูลความยินยอม' : 'Consent data found'}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}</p>
                        <p className="font-medium">{consentData.title} {consentData.name_surname}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{language === 'th' ? 'เลขบัตรประชาชน/พาสปอร์ต' : 'ID/Passport'}</p>
                        <p className="font-medium">{consentData.id_passport}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{language === 'th' ? 'วันที่ให้ความยินยอม' : 'Consent Date'}</p>
                        <p className="font-medium">
                          {new Date(consentData.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    {consentData.email && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">{language === 'th' ? 'อีเมล' : 'Email'}</p>
                        <p className="font-medium">{consentData.email}</p>
                      </div>
                    )}

                    {consentData.phone && (
                      <div>
                        <p className="text-sm text-gray-500">{language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'}</p>
                        <p className="font-medium">{consentData.phone}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">{language === 'th' ? 'รายละเอียดความยินยอม' : 'Consent Details'}</p>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">
                          {language === 'th' 
                            ? `ได้ให้ความยินยอมในการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ตามนโยบายความเป็นส่วนตัว เวอร์ชัน ${consentData.consent_version || '1.0'}`
                            : `Consented to the collection, use, and disclosure of personal data according to Privacy Policy version ${consentData.consent_version || '1.0'}`
                          }
                        </p>
                      </div>
                    </div>
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

export default CheckConsent;
