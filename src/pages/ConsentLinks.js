import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, Globe, Users, Building, Briefcase, Settings } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const ConsentLinks = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [copiedLink, setCopiedLink] = useState('');
  const [loading, setLoading] = useState(true);

  // Get base URL for consent links
  const getBaseUrl = () => {
    return window.location.origin;
  };

  // Load user types from backend
  const loadUserTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user-types`);
      if (response.data && response.data.success) {
        setUserTypes(response.data.data || []);
      } else {
        // Default user types if API fails
        setUserTypes([
          { id: 1, type_code: 'customer', type_name: 'Customer', type_name_th: 'ลูกค้า' },
          { id: 2, type_code: 'employee', type_name: 'Employee', type_name_th: 'พนักงาน' },
          { id: 3, type_code: 'partner', type_name: 'Partner', type_name_th: 'พาร์ทเนอร์' }
        ]);
      }
    } catch (error) {
      console.error('Error loading user types:', error);
      // Use default types on error
      setUserTypes([
        { id: 1, type_code: 'customer', type_name: 'Customer', type_name_th: 'ลูกค้า' },
        { id: 2, type_code: 'employee', type_name: 'Employee', type_name_th: 'พนักงาน' },
        { id: 3, type_code: 'partner', type_name: 'Partner', type_name_th: 'พาร์ทเนอร์' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTypes();
  }, []);

  // Copy link to clipboard
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(''), 3000);
  };

  // Get icon for user type
  const getTypeIcon = (typeCode) => {
    switch(typeCode) {
      case 'customer':
        return <Users className="w-5 h-5" />;
      case 'employee':
        return <Building className="w-5 h-5" />;
      case 'partner':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  // Get color scheme for user type
  const getTypeColor = (typeCode) => {
    switch(typeCode) {
      case 'customer':
        return 'from-blue-500 to-blue-600';
      case 'employee':
        return 'from-green-500 to-green-600';
      case 'partner':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Admin Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <a 
          href="/admin/dashboard"
          className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Admin</span>
        </a>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Consent Form Links</h1>
              <p className="text-gray-600">ลิงก์สำหรับแต่ละประเภทผู้ใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTypes.map((userType) => (
            <div key={userType.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${getTypeColor(userType.type_code)} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  {getTypeIcon(userType.type_code)}
                  <div>
                    <h3 className="font-semibold text-lg">{userType.type_name}</h3>
                    <p className="text-white/90 text-sm">{userType.type_name_th}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {userType.type_code === 'customer' ? (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      ลูกค้าจะต้องเลือกภาษาก่อนเข้าใช้งาน
                    </p>
                    <div className="space-y-3">
                      {/* Main link for customer - will show language selection */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            <Globe className="w-4 h-4 inline mr-1" />
                            ลิงก์หลัก (เลือกภาษา)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${getBaseUrl()}/consent/customer`}
                            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(`${getBaseUrl()}/consent/customer`)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {copiedLink === `${getBaseUrl()}/consent/customer` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Direct Thai link */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            ลิงก์ภาษาไทย (ตรง)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${getBaseUrl()}/consent/customer?lang=th`}
                            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(`${getBaseUrl()}/consent/customer?lang=th`)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {copiedLink === `${getBaseUrl()}/consent/customer?lang=th` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Direct English link */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            English Link (Direct)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${getBaseUrl()}/consent/customer?lang=en`}
                            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(`${getBaseUrl()}/consent/customer?lang=en`)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {copiedLink === `${getBaseUrl()}/consent/customer?lang=en` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      ภาษากำหนดตอนสร้างนโยบาย
                    </p>
                    <div className="space-y-3">
                      {/* Thai link for non-customer types */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            ลิงก์ภาษาไทย
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${getBaseUrl()}/consent/${userType.type_code}?lang=th`}
                            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(`${getBaseUrl()}/consent/${userType.type_code}?lang=th`)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {copiedLink === `${getBaseUrl()}/consent/${userType.type_code}?lang=th` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* English link for non-customer types */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            English Link
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${getBaseUrl()}/consent/${userType.type_code}?lang=en`}
                            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(`${getBaseUrl()}/consent/${userType.type_code}?lang=en`)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {copiedLink === `${getBaseUrl()}/consent/${userType.type_code}?lang=en` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">วิธีใช้งาน</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="text-blue-600 font-semibold">1.</span>
              <div>
                <strong>ลูกค้า (Customer):</strong> สามารถเลือกใช้ลิงก์หลักเพื่อให้ลูกค้าเลือกภาษาเอง 
                หรือใช้ลิงก์ที่ระบุภาษาไว้แล้ว
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-semibold">2.</span>
              <div>
                <strong>พนักงาน/พาร์ทเนอร์:</strong> ใช้ลิงก์ตามภาษาที่ต้องการ 
                โดยภาษาจะถูกกำหนดจากลิงก์ที่ส่งให้
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-semibold">3.</span>
              <div>
                คัดลอกลิงก์โดยคลิกที่ปุ่ม <Copy className="w-4 h-4 inline" /> 
                แล้วส่งให้ผู้ใช้งานตามประเภท
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentLinks;
