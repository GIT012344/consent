import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, ChevronRight } from 'lucide-react';

const InitialRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    idPassport: '',
    email: '',
    phone: '',
    userType: 'customer'
  });
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'th'
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'กรุณาเลือกคำนำหน้า';
    if (!formData.fullName) newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!formData.idPassport) newErrors.idPassport = 'กรุณากรอกเลขบัตรประชาชน/พาสปอร์ต';
    
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
        language: language,
        userType: formData.userType,
        email: formData.email,
        phone: formData.phone,
        idPassport: formData.idPassport
      }));
      // บันทึก language แยกต่างหากด้วย
      localStorage.setItem('language', language);
      navigate('/consent');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'th' ? 'ลงทะเบียนเบื้องต้น' : 'Initial Registration'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'th' ? 'กรุณากรอกข้อมูลเพื่อดำเนินการต่อ' : 'Please fill in your information to continue'}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => {
                  setLanguage('th');
                  localStorage.setItem('language', 'th');
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  language === 'th' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ไทย
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  localStorage.setItem('language', 'en');
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'ประเภทผู้ใช้' : 'User Type'}
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="customer">{language === 'th' ? 'ลูกค้า' : 'Customer'}</option>
                <option value="employee">{language === 'th' ? 'พนักงาน' : 'Employee'}</option>
                <option value="partner">{language === 'th' ? 'พันธมิตร' : 'Partner'}</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'คำนำหน้า' : 'Title'}
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">{language === 'th' ? 'เลือกคำนำหน้า' : 'Select Title'}</option>
                <option value="นาย">{language === 'th' ? 'นาย' : 'Mr.'}</option>
                <option value="นาง">{language === 'th' ? 'นาง' : 'Mrs.'}</option>
                <option value="นางสาว">{language === 'th' ? 'นางสาว' : 'Ms.'}</option>
              </select>
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={language === 'th' ? 'กรอกชื่อ-นามสกุล' : 'Enter your full name'}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* ID/Passport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เลขบัตรประชาชน/พาสปอร์ต' : 'ID/Passport Number'}
              </label>
              <input
                type="text"
                name="idPassport"
                value={formData.idPassport}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.idPassport ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={language === 'th' ? 'กรอกเลขบัตรประชาชนหรือพาสปอร์ต' : 'Enter ID or passport number'}
              />
              {errors.idPassport && <p className="text-red-500 text-xs mt-1">{errors.idPassport}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'อีเมล' : 'Email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'th' ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === 'th' ? 'เบอร์โทรศัพท์ (ไม่บังคับ)' : 'Phone number (optional)'}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {language === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InitialRegistration;
