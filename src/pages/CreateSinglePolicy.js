import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateSinglePolicy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCustomUserType, setShowCustomUserType] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    version: '1.0.0',
    language: 'th-TH',
    userType: 'customer',
    customUserType: '',
    title: '',
    content: '',
    effective_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    is_mandatory: true,
    enforce_mode: 'strict'
  });

  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Predefined user types
  const userTypes = [
    { value: 'customer', label: { th: 'ลูกค้า', en: 'Customer' } },
    { value: 'employee', label: { th: 'พนักงาน', en: 'Employee' } },
    { value: 'partner', label: { th: 'พาร์ทเนอร์', en: 'Partner' } },
    { value: 'vendor', label: { th: 'ผู้ขาย', en: 'Vendor' } },
    { value: 'contractor', label: { th: 'ผู้รับเหมา', en: 'Contractor' } },
    { value: 'other', label: { th: 'อื่นๆ', en: 'Other' } }
  ];

  const languages = [
    { value: 'th-TH', label: '🇹🇭 ภาษาไทย' },
    { value: 'en-US', label: 'English' }
  ];



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine the actual user type
      const actualUserType = formData.userType === 'other' 
        ? (formData.customUserType || 'other')
        : formData.userType;

      // Create simplified policy with single audience
      // Convert language format properly: th-TH -> th, en-US -> en
      let languageCode = formData.language;
      console.log('Form language value:', formData.language); // Debug log
      
      if (formData.language === 'th-TH' || formData.language === 'ภาษาไทย') {
        languageCode = 'th';
      } else if (formData.language === 'en-US' || formData.language === 'English') {
        languageCode = 'en';
      }
      
      console.log('Converted language code:', languageCode); // Debug log
      
      const policyData = {
        tenant_code: 'default',  // Use default tenant
        version: formData.version,
        language: languageCode,  // Use converted language code
        user_type: actualUserType,  // Changed from userType to user_type
        title: formData.title,
        content: formData.content,
        effective_date: formData.effective_date,
        expiry_date: formData.expiry_date,
        is_mandatory: formData.is_mandatory,
        enforce_mode: formData.enforce_mode
      };
      
      console.log('Policy data being sent:', policyData); // Debug log

      const response = await axios.post(`${API_BASE_URL}/api/simple-policy`, policyData);
      
      if (response.data.success) {
        // Refresh Policy Management page data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // Generate links based on user type
        const links = [];
        const userTypeLabel = actualUserType.charAt(0).toUpperCase() + actualUserType.slice(1);
        
        if (actualUserType === 'customer') {
          // For customer, show language selection page link
          links.push({
            label: `${userTypeLabel} (เลือกภาษา / Select Language)`,
            url: `${window.location.origin}/consent/select-language`,
            description: 'ลูกค้าจะเลือกภาษาก่อนเข้าสู่หน้า consent'
          });
        } else {
          // For other user types, show direct links with fixed language
          // Thai link
          links.push({
            label: `${userTypeLabel} - ภาษาไทย`,
            url: `${window.location.origin}/consent/${actualUserType}?lang=th`,
            description: 'ลิงก์สำหรับภาษาไทย'
          });
          
          // English link
          links.push({
            label: `${userTypeLabel} - English`,
            url: `${window.location.origin}/consent/${actualUserType}?lang=en`,
            description: 'ลิงก์สำหรับภาษาอังกฤษ'
          });
        }
        
        setGeneratedLinks(links);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      if (error.response?.status === 409) {
        // Policy ซ้ำ
        alert(error.response.data.message || 'Policy นี้มีอยู่แล้ว!');
      } else {
        alert('เกิดข้อผิดพลาดในการสร้าง Policy');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('คัดลอกลิงก์แล้ว!');
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setGeneratedLinks([]);
    setFormData({
      ...formData,
      version: formData.version, // Keep version
      title: '',
      content: '',
      customUserType: ''
    });
    setShowCustomUserType(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สร้าง Policy สำเร็จ!</h2>
              <p className="text-gray-600 mt-2">
                Policy สำหรับ {formData.userType === 'other' ? formData.customUserType : formData.userType} 
                {' '}ภาษา {formData.language === 'th-TH' ? 'ไทย' : 'อังกฤษ'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Consent Links:</p>
              {generatedLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={link.url}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-white"
                  />
                  <button
                    onClick={() => handleCopyLink(link.url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    คัดลอก
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateAnother}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                สร้าง Policy อื่น
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                กลับหน้า Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">สร้าง Policy (ทีละ UserType + ภาษา)</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language and User Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ภาษา <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({...formData, userType: value});
                    setShowCustomUserType(value === 'other');
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {userTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {formData.language === 'th-TH' ? type.label.th : type.label.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom User Type Input */}
            {showCustomUserType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระบุ User Type อื่นๆ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customUserType}
                  onChange={(e) => setFormData({...formData, customUserType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น consultant, intern, visitor"
                  required={showCustomUserType}
                />
              </div>
            )}

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1.0.0"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ Policy <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={formData.language === 'th-TH' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                required
              />
            </div>

            {/* Content with Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เนื้อหา Policy <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-lg">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['clean']
                    ]
                  }}
                  formats={[
                    'header',
                    'bold', 'italic', 'underline',
                    'list', 'bullet',
                    'align'
                  ]}
                  style={{ height: '300px', marginBottom: '50px' }}
                  placeholder="เนื้อหา consent ที่จะแสดงให้ผู้ใช้อ่าน..."
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่เริ่มใช้งาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่สิ้นสุด (ถ้ามี)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({...formData, is_mandatory: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">บังคับให้ยอมรับ</span>
              </label>

              <label className="flex items-center gap-2">
                <span className="text-sm">Enforce Mode:</span>
                <select
                  value={formData.enforce_mode}
                  onChange={(e) => setFormData({...formData, enforce_mode: e.target.value})}
                  className="px-2 py-1 border rounded"
                >
                  <option value="strict">Strict</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!formData.title || !formData.content}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                👁️ ดูตัวอย่าง
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้าง Policy'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/policies')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                จัดการ Policy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">ตัวอย่างการแสดงผล</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">UserType: {formData.userType === 'other' ? formData.customUserType : formData.userType}</p>
                <p className="text-sm text-gray-600">ภาษา: {formData.language === 'th-TH' ? 'ไทย' : 'English'}</p>
                <p className="text-sm text-gray-600">Version: {formData.version}</p>
              </div>
              <h3 className="text-2xl font-bold mb-4">{formData.title}</h3>
              <div className="prose prose-sm max-w-none">
                {formData.content.includes('<') && formData.content.includes('>') ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                    className="policy-content whitespace-pre-wrap [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>p]:whitespace-pre-wrap [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>li]:mb-2 [&>li]:whitespace-pre-wrap [&>strong]:font-bold [&>em]:italic [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:whitespace-pre-wrap [&>hr]:my-6 [&>hr]:border-gray-300 [&_*]:whitespace-pre-wrap"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{formData.content}</div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                  {formData.language === 'th-TH' ? 'ยอมรับ' : 'Accept'}
                </button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
                  {formData.language === 'th-TH' ? 'ไม่ยอมรับ' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Multiple Links */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">สร้าง Policy สำเร็จ!</h2>
              <p className="text-gray-600">Consent Links สำหรับ {formData.userType === 'customer' ? 'ลูกค้า' : 'ผู้ใช้ประเภท ' + formData.userType}:</p>
            </div>

            <div className="space-y-3 mb-6">
              {generatedLinks.map((link, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">{link.label}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(link.url, '_blank')}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        🔗 เปิดลิงก์
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link.url);
                          alert('คัดลอกลิงก์แล้ว!');
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        📋 คัดลอก
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded border p-2 text-sm text-gray-600 break-all">
                    {link.url}
                  </div>
                  {link.description && (
                    <p className="text-xs text-gray-500 mt-2">{link.description}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📌 วิธีใช้งานลิงก์:</h3>
              {formData.userType === 'customer' ? (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ส่งลิงก์นี้ให้ลูกค้า เพื่อให้เลือกภาษาก่อนเข้าสู่หน้า consent</li>
                  <li>• ลูกค้าจะเห็นหน้าเลือกภาษา (ไทย/อังกฤษ) ก่อน</li>
                  <li>• หลังเลือกภาษา จะเข้าสู่หน้า consent ตามภาษาที่เลือก</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• เลือกลิงก์ตามภาษาที่ต้องการให้ผู้ใช้เห็น</li>
                  <li>• ผู้ใช้จะเข้าสู่หน้า consent โดยตรงตามภาษาที่กำหนด</li>
                  <li>• ไม่มีขั้นตอนการเลือกภาษา</li>
                </ul>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setFormData({
                    version: '1.0.0',
                    language: 'th-TH',
                    userType: 'customer',
                    customUserType: '',
                    title: '',
                    content: '',
                    effective_date: new Date().toISOString().split('T')[0],
                    expiry_date: '',
                    is_mandatory: true,
                    enforce_mode: 'strict'
                  });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                สร้าง Policy ใหม่
              </button>
              <button
                onClick={() => navigate('/admin/links')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ไปยังหน้าจัดการ Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSinglePolicy;
