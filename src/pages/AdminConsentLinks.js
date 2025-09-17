import React, { useState, useEffect } from 'react';
import { Link2, Copy, CheckCircle, Globe, Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminConsentLinks = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);
  const baseUrl = window.location.origin;

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://consent-back.onrender.com/api/simple-policy');
      if (response.data && response.data.success) {
        setPolicies(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const generateLink = (userType, language) => {
    if (userType === 'customer') {
      // Customer type - link to language selection page
      return `${baseUrl}/consent/select-language`;
    } else {
      // Other types - direct link with language
      return `${baseUrl}/consent/${userType}?lang=${language === 'th-TH' ? 'th' : 'en'}`;
    }
  };

  // Group policies by user type
  const groupedPolicies = policies.reduce((acc, policy) => {
    const userType = policy.user_type || 'customer';
    if (!acc[userType]) {
      acc[userType] = [];
    }
    acc[userType].push(policy);
    return acc;
  }, {});

  const userTypeInfo = {
    customer: { 
      label: 'ลูกค้า (Customer)', 
      icon: '👥', 
      color: 'blue',
      description: 'ลิงก์สำหรับลูกค้าทั่วไป - มีหน้าเลือกภาษา'
    },
    employee: { 
      label: 'พนักงาน (Employee)', 
      icon: '👔', 
      color: 'green',
      description: 'ลิงก์สำหรับพนักงาน - ภาษากำหนดไว้ในลิงก์'
    },
    partner: { 
      label: 'พาร์ทเนอร์ (Partner)', 
      icon: '🤝', 
      color: 'purple',
      description: 'ลิงก์สำหรับพาร์ทเนอร์ - ภาษากำหนดไว้ในลิงก์'
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Link2 className="w-6 h-6" />
          Consent Links Management
        </h1>
        <p className="text-gray-600 mt-2">
          จัดการลิงก์สำหรับแต่ละประเภทผู้ใช้งาน
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Type - Special Case */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  ลูกค้า (Customer)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  ลิงก์สำหรับลูกค้าทั่วไป - จะแสดงหน้าเลือกภาษาก่อน
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">ลิงก์สำหรับลูกค้า (มีหน้าเลือกภาษา)</p>
                  <code className="text-sm bg-white px-3 py-1 rounded border border-gray-300 inline-block">
                    {generateLink('customer')}
                  </code>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(generateLink('customer'), 'customer-main')}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy link"
                  >
                    {copiedLink === 'customer-main' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={generateLink('customer')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Show available policies for customer */}
            {groupedPolicies['customer'] && groupedPolicies['customer'].length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">นโยบายที่พร้อมใช้งาน:</p>
                {groupedPolicies['customer'].map(policy => (
                  <div key={policy.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${policy.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span>{policy.title}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {policy.language === 'th-TH' ? 'ไทย' : 'English'}
                    </span>
                    <span className="text-xs text-gray-500">v{policy.version}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other User Types */}
          {['employee', 'partner'].map(userType => {
            const info = userTypeInfo[userType];
            const typePolicies = groupedPolicies[userType] || [];

            return (
              <div key={userType} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      {info.label}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>

                {typePolicies.length > 0 ? (
                  <div className="space-y-3">
                    {typePolicies.map(policy => {
                      const link = generateLink(userType, policy.language);
                      const linkId = `${userType}-${policy.id}`;

                      return (
                        <div key={policy.id} className={`bg-${info.color}-50 border border-${info.color}-200 rounded-lg p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-medium text-gray-700">
                                  {policy.title}
                                </p>
                                <span className="text-xs bg-white px-2 py-1 rounded border">
                                  {policy.language === 'th-TH' ? '🇹🇭 ไทย' : '🇬🇧 English'}
                                </span>
                                <span className="text-xs text-gray-500">v{policy.version}</span>
                                {policy.is_active && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Active
                                  </span>
                                )}
                              </div>
                              <code className="text-xs bg-white px-3 py-1 rounded border border-gray-300 inline-block">
                                {link}
                              </code>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => copyToClipboard(link, linkId)}
                                className={`p-2 bg-${info.color}-600 text-white rounded-lg hover:bg-${info.color}-700 transition-colors`}
                                title="Copy link"
                              >
                                {copiedLink === linkId ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-500">ยังไม่มีนโยบายสำหรับ {info.label}</p>
                    <Link
                      to="/admin/policy/create"
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      สร้างนโยบายใหม่ →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          วิธีการใช้งานลิงก์
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <strong>ลูกค้า (Customer):</strong>
            <ul className="ml-4 mt-1 list-disc">
              <li>ใช้ลิงก์เดียว: <code className="bg-white px-2 py-1 rounded">/consent/select-language</code></li>
              <li>ผู้ใช้จะเห็นหน้าเลือกภาษา (ไทย/อังกฤษ) ก่อน</li>
              <li>หลังเลือกภาษาจะไปยังฟอร์ม consent ตามภาษาที่เลือก</li>
            </ul>
          </div>
          <div className="mt-3">
            <strong>พนักงาน/พาร์ทเนอร์ (Employee/Partner):</strong>
            <ul className="ml-4 mt-1 list-disc">
              <li>ใช้ลิงก์ที่มีภาษากำหนดไว้: <code className="bg-white px-2 py-1 rounded">/consent/[type]?lang=[th/en]</code></li>
              <li>ไม่มีหน้าเลือกภาษา - ไปยังฟอร์ม consent โดยตรง</li>
              <li>แอดมินต้องให้ลิงก์ที่ถูกต้องตามภาษาที่ต้องการ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsentLinks;
