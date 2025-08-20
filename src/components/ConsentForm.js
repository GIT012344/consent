import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Loader2, Shield, Info, ArrowLeft, Send, ArrowRight } from 'lucide-react';
import { consentAPI } from '../services/api';
import ConsentContent from './ConsentContent';
import axios from 'axios';

const ConsentForm = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [step, setStep] = useState(1); // 1 = form, 2 = terms
  const [lang, setLang] = useState('th');
  const [formData, setFormData] = useState({
    idPassport: '',
    email: '',
    phone: '',
    consentGiven: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [existingRecord, setExistingRecord] = useState(null);
  const [activeVersion, setActiveVersion] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);

  // ดึงข้อมูลจาก localStorage และ active consent version
  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData(parsedData);
      // Use language from userData first, then fallback to localStorage or 'th'
      const userLang = parsedData.language || localStorage.getItem('language') || 'th';
      setLang(userLang);
      // Ensure localStorage is in sync
      localStorage.setItem('language', userLang);
    } else {
      navigate('/register');
    }

    fetchActiveVersion();
  }, [navigate]);

  const fetchActiveVersion = async () => {
    try {
      // Get userType from sessionStorage or userData
      const registrationData = sessionStorage.getItem('registrationData');
      let userType = 'customer';
      
      if (registrationData) {
        const parsed = JSON.parse(registrationData);
        userType = parsed.userType || 'customer';
      } else if (userData?.userType) {
        userType = userData.userType;
      }
      
      // Fetch version based on userType and language
      const response = await consentAPI.getActiveVersionByType(userType, lang);
      if (response?.data) {
        setActiveVersion(response.data);
        console.log(`Using version for ${userType}:`, response.data.version);
      }
      
      // Also fetch form template
      await fetchFormTemplate(userType, lang);
      
    } catch (error) {
      console.log('Using default consent version');
      // ใช้ default version ถ้า API ไม่ทำงาน
      setActiveVersion({
        id: 1,
        version: '1.0',
        language: lang
      });
    }
  };

  // Fetch form template based on userType
  const fetchFormTemplate = async (userType, language) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/form-templates/active/${userType}/${language}`);
      if (response?.data?.data) {
        const template = response.data.data;
        // Store template for later use
        setFormTemplate(template);
        console.log(`Using form template for ${userType}`);
        return template;
      }
    } catch (error) {
      console.error('Error fetching form template:', error);
    }
    return null;
  };

  // Text translations
  const text = {
    th: {
      idLabel: 'เลขบัตรประชาชน/Passport *',
      idPlaceholder: 'กรอกเลขบัตรประชาชน หรือ Passport',
      emailLabel: 'อีเมล *',
      emailPlaceholder: 'กรอกอีเมล',
      phoneLabel: 'เบอร์โทรศัพท์ *',
      phonePlaceholder: 'กรอกเบอร์โทรศัพท์',
      backBtn: 'กลับ',
      submitBtn: 'ส่งความยินยอม'
    },
    en: {
      idLabel: 'ID Card/Passport Number *',
      idPlaceholder: 'Enter ID Card or Passport number',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'Enter your email address',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: 'Enter your phone number',
      backBtn: 'Back',
      submitBtn: 'Submit Consent'
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // ถ้ากรอก ID/Passport ครบแล้ว ให้เช็ค version ที่ควรใช้
    if (name === 'idPassport' && value.length >= 13) {
      fetchActiveVersion();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // ฟังก์ชันตรวจสอบเลขบัตรประชาชนไทย
  const validateThaiID = (id) => {
    if (!/^[0-9]{13}$/.test(id)) return false;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id.charAt(i)) * (13 - i);
    }
    
    const remainder = sum % 11;
    const checkDigit = (11 - remainder) % 10;
    
    return checkDigit === parseInt(id.charAt(12));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idPassport.trim()) {
      newErrors.idPassport = lang === 'en' ? 'ID/Passport is required' : 'กรุณากรอกเลขบัตรประชาชน/Passport';
    } else {
      const cleanId = formData.idPassport.replace(/[-\s]/g, '');
      
      // ตรวจสอบว่าเป็นเลขบัตรประชาชนไทย (13 หลัก) หรือ Passport
      if (/^[0-9]{13}$/.test(cleanId)) {
        // เลขบัตรประชาชนไทย - ตรวจสอบ checksum
        if (!validateThaiID(cleanId)) {
          newErrors.idPassport = lang === 'en' 
            ? 'Invalid Thai ID card number' 
            : 'เลขบัตรประชาชนไม่ถูกต้อง';
        }
      } else if (cleanId.length < 6 || cleanId.length > 15) {
        // Passport หรือเอกสารอื่น - ตรวจสอบความยาว
        newErrors.idPassport = lang === 'en' 
          ? 'ID/Passport must be 6-15 characters' 
          : 'เลขบัตร/Passport ต้องมี 6-15 ตัวอักษร';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = lang === 'en' ? 'Email is required' : 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = lang === 'en' ? 'Invalid email format' : 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = lang === 'en' ? 'Phone number is required' : 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9+\-\s()]{8,15}$/.test(formData.phone)) {
      newErrors.phone = lang === 'en' ? 'Invalid phone number format' : 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if record already exists
    if (existingRecord) {
      setMessage({
        type: 'error',
        text: lang === 'en' ? 'This ID has already given consent' : 'เลขบัตรนี้ได้ให้ความยินยอมแล้ว'
      });
      return;
    }

    // ไปขั้นตอนต่อไป (แสดงเงื่อนไข)
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consentGiven) {
      setErrors({
        consentGiven: lang === 'en' ? 'Please accept the terms and conditions' : 'กรุณายอมรับข้อตกลงและเงื่อนไข'
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get userType from sessionStorage
      const registrationData = sessionStorage.getItem('registrationData');
      let userType = 'customer';
      
      if (registrationData) {
        const parsed = JSON.parse(registrationData);
        userType = parsed.userType || 'customer';
      }
      
      // Combine firstName and lastName into nameSurname for backend
      const nameSurname = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 
                         `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
      
      const submitData = {
        ...userData,
        ...formData,
        nameSurname: nameSurname, // Backend expects this field
        language: lang,
        consentType: userData?.userType || 'customer',
        userType: userData?.userType || 'customer',
        consentVersion: activeVersion?.version || '1.0',
        consentVersionId: activeVersion?.id || null,
        formTemplateId: formTemplate?.id || null
      };

      console.log('Submitting data:', submitData);
      const result = await consentAPI.submitConsent(submitData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: lang === 'en' 
            ? 'Your consent has been successfully recorded' 
            : 'บันทึกความยินยอมของคุณเรียบร้อยแล้ว'
        });
        
        // Clear form after successful submission
        setTimeout(() => {
          localStorage.removeItem('userData');
          navigate('/');
        }, 3000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      // Check if it's a duplicate consent error
      if (error.response?.status === 409 || error.message?.includes('already exists')) {
        const existingRec = error.response?.data?.existingRecord;
        
        // Show existing record info if available
        if (existingRec) {
          setExistingRecord(existingRec);
          
          // Check if it's same version or different version
          if (existingRec.consent_version === activeVersion?.version) {
            setMessage({
              type: 'warning',
              text: lang === 'en' 
                ? `You have already given consent for version ${existingRec.consent_version}. Please check your existing consent status.`
                : `คุณได้ให้ความยินยอมสำหรับเวอร์ชัน ${existingRec.consent_version} แล้ว กรุณาตรวจสอบสถานะความยินยอมของคุณ`
            });
          } else {
            setMessage({
              type: 'info',
              text: lang === 'en' 
                ? `You previously consented to version ${existingRec.consent_version}. The current version is ${activeVersion?.version}. Please submit again for the new version.`
                : `คุณเคยให้ความยินยอมกับเวอร์ชัน ${existingRec.consent_version} เวอร์ชันปัจจุบันคือ ${activeVersion?.version} กรุณาส่งใหม่สำหรับเวอร์ชันใหม่`
            });
          }
        } else {
          setMessage({
            type: 'warning',
            text: lang === 'en' 
              ? 'Consent record already exists for this ID/Passport.'
              : 'มีข้อมูลความยินยอมสำหรับเลขบัตรประชาชน/พาสปอร์ตนี้แล้ว'
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: lang === 'en'
            ? error.message || 'An error occurred while processing your request'
            : error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Consent text content
  // Consent text is now in ConsentContent component

  // Loading state
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (step === 1) {
    // Step 1: Data Input Form
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {lang === 'th' ? 'กรอกข้อมูลส่วนตัว' : 'Personal Information'}
            </h1>
            <p className="text-gray-600">
              {userData?.title} {userData?.fullName}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <form onSubmit={handleNext} className="space-y-6">
              {/* ID/Passport */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {text[lang].idLabel}
                </label>
                <input
                  type="text"
                  name="idPassport"
                  value={formData.idPassport}
                  onChange={handleInputChange}
                  placeholder={text[lang].idPlaceholder}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
                />
                {errors.idPassport && (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.idPassport}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {text[lang].emailLabel}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={text[lang].emailPlaceholder}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {text[lang].phoneLabel}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={text[lang].phonePlaceholder}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {message.text && (
                <div className={`p-4 rounded-xl border-2 ${
                  message.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all font-medium"
                >
                  <ArrowLeft className="h-5 w-5 inline mr-2" />
                  {text[lang].backBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {lang === 'th' ? 'ถัดไป' : 'Next'}
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Terms and Consent
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'th' ? 'ข้อตกลงและเงื่อนไข' : 'Terms and Conditions'}
          </h1>
          <p className="text-gray-600">
            {userData?.title} {userData?.fullName}
          </p>
        </div>

        {/* Terms Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Terms Content */}
          <div className="max-h-96 overflow-y-auto mb-6 bg-gray-50 rounded-xl">
            <ConsentContent 
              userData={userData}
              formData={formData}
              language={lang}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                name="consentGiven"
                checked={formData.consentGiven}
                onChange={handleInputChange}
                className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">
                  {lang === 'th' ? 'ข้าพเจ้ายินยอมตามข้อตกลงข้างต้น' : 'I agree to the terms and conditions above'}
                </span>
              </label>
            </div>
            {errors.consentGiven && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.consentGiven}
              </p>
            )}

            {/* Success/Error Messages */}
            {message.text && (
              <div className={`p-4 rounded-xl border-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  ) : message.type === 'error' ? (
                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  ) : (
                    <Info className="h-6 w-6 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                    
                    {/* Show existing record if available */}
                    {existingRecord && message.type === 'warning' && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-300">
                        <p className="text-sm font-semibold mb-2">
                          {lang === 'en' ? 'Existing Consent Information:' : 'ข้อมูลความยินยอมที่มีอยู่:'}
                        </p>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">{lang === 'en' ? 'Name:' : 'ชื่อ:'}</span> {existingRecord.title} {existingRecord.name_surname}</p>
                          <p><span className="font-medium">{lang === 'en' ? 'Date:' : 'วันที่:'}</span> {new Date(existingRecord.created_date).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH')}</p>
                          <p><span className="font-medium">{lang === 'en' ? 'Version:' : 'เวอร์ชัน:'}</span> {existingRecord.consent_version || '1.0'}</p>
                          <p><span className="font-medium">{lang === 'en' ? 'Current Version:' : 'เวอร์ชันปัจจุบัน:'}</span> {activeVersion?.version || '1.0'}</p>
                          <p><span className="font-medium">{lang === 'en' ? 'Type:' : 'ประเภท:'}</span> {existingRecord.consent_type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/check')}
                          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                        >
                          {lang === 'en' ? 'Check Consent Status →' : 'ตรวจสอบสถานะความยินยอม →'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all font-medium"
              >
                <ArrowLeft className="h-5 w-5 inline mr-2" />
                {text[lang].backBtn}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {lang === 'th' ? 'กำลังส่ง...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 inline mr-2" />
                    {text[lang].submitBtn}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;
