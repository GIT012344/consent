import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Users, Briefcase, Check, ArrowRight } from 'lucide-react';
import axios from 'axios';

const InitialRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    userType: 'customer' // Default to customer
  });
  const [errors, setErrors] = useState({});
  // Load saved language from localStorage
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'th';
  });

  const titles = {
    th: [
      { value: 'นาย', label: 'นาย' },
      { value: 'นาง', label: 'นาง' },
      { value: 'นางสาว', label: 'นางสาว' }
    ],
    en: [
      { value: 'Mr.', label: 'Mr.' },
      { value: 'Mrs.', label: 'Mrs.' },
      { value: 'Miss', label: 'Miss' }
    ]
  };

  const text = {
    th: {
      title: 'ระบบจัดการความยินยอม',
      subtitle: 'เริ่มต้นการให้ความยินยอม',
      titleLabel: 'คำนำหน้า',
      nameLabel: 'ชื่อ-นามสกุล',
      namePlaceholder: 'กรอกชื่อ-นามสกุลของคุณ',
      next: 'ถัดไป',
      titleRequired: 'กรุณาเลือกคำนำหน้า',
      nameRequired: 'กรุณากรอกชื่อ-นามสกุล'
    },
    en: {
      title: 'Consent Management',
      subtitle: 'Start Consent Process',
      titleLabel: 'Title',
      nameLabel: 'Full Name',
      namePlaceholder: 'Enter your full name',
      next: 'Next',
      titleRequired: 'Please select a title',
      nameRequired: 'Please enter your full name'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = text[language].titleRequired;
    if (!formData.fullName.trim()) newErrors.fullName = text[language].nameRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // บันทึก userData
      localStorage.setItem('userData', JSON.stringify({
        title: formData.title,
        fullName: formData.fullName,
        language: language
      }));
      // บันทึก language แยกต่างหากด้วย เพื่อให้ ConsentForm อ่านได้
      localStorage.setItem('language', language);
      navigate('/consent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {text[language].title}
          </h1>
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm border">
            <button
              type="button"
              onClick={() => {
                setLanguage('th');
                localStorage.setItem('language', 'th');
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                language === 'th' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage('en');
                localStorage.setItem('language', 'en');
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                language === 'en' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'th' ? 'ประเภทผู้ใช้งาน' : 'User Type'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'customer' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.userType === 'customer'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-medium">
                    {language === 'th' ? 'ลูกค้าทั่วไป' : 'Customer'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {language === 'th' ? 'บุคคลภายนอก' : 'External User'}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'employee' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.userType === 'employee'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="font-medium">
                    {language === 'th' ? 'พนักงาน' : 'Employee'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {language === 'th' ? 'บุคลากรภายใน' : 'Internal Staff'}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'partner' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.userType === 'partner'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="font-medium">
                    {language === 'th' ? 'พาร์ทเนอร์' : 'Partner'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {language === 'th' ? 'หุ้นส่วนธุรกิจ' : 'Business Partner'}
                  </div>
                </button>
              </div>
            </div>

            {/* Title Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {text[language].titleLabel}
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
              >
                <option value="">{language === 'th' ? 'เลือกคำนำหน้า...' : 'Select title...'}</option>
                {titles[language].map((title) => (
                  <option key={title.value} value={title.value}>
                    {title.label}
                  </option>
                ))}
              </select>
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {text[language].nameLabel}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={text[language].namePlaceholder}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {text[language].next}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InitialRegistration;
