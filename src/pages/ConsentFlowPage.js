import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Globe, User, FileText, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';  
import { useNavigate } from 'react-router-dom';

const ConsentFlowPage = () => {
  const { userType } = useParams();
  const [searchParams] = useSearchParams();
  const urlLang = searchParams.get('lang');
  
  const navigate = useNavigate();
  // State management
  // Customer type should redirect to language selection page
  // Other types go directly to form (step 2)
  const [currentStep, setCurrentStep] = useState(2);
  // Use URL params for language, required for all types
  const [language, setLanguage] = useState(urlLang || 'th');
  const [selectedUserType, setSelectedUserType] = useState(userType || 'customer');
  const [formData, setFormData] = useState({
    nameSurname: '',
    idPassportNumber: '',
    email: '',
    phone: '',
    consentAccepted: false
  });
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [policyContent, setPolicyContent] = useState(null);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Translations
  const t = {
    th: {
      selectLanguage: 'เลือกภาษา (Choose Language)',
      thai: 'ภาษาไทย',
      english: 'English',
      selectUserType: 'เลือกประเภทผู้ใช้',
      userType: 'ประเภทผู้ใช้',
      customer: 'ลูกค้า',
      employee: 'พนักงาน',
      partner: 'พาร์ทเนอร์',
      personalInfo: 'ข้อมูลส่วนตัว',
      title: 'คำนำหน้า',
      name: 'ชื่อ',
      surname: 'นามสกุล',
      idPassportNumber: 'เลขบัตรประชาชน/พาสปอร์ต',
      next: 'ถัดไป',
      back: 'ย้อนกลับ',
      idPassport: 'เลขบัตรประชาชน/พาสปอร์ต',
      enterIdPassport: 'กรอกเลขบัตรประชาชนหรือพาสปอร์ต',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์',
      consentPolicy: 'นโยบายความยินยอม',
      step: 'ขั้นตอน',
      version: 'เวอร์ชัน',
      iAgree: 'ข้าพเจ้ายอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว',
      accept: 'ยอมรับ',
      selectTitle: 'เลือกคำนำหน้า',
      pleaseSelect: 'กรุณาเลือก',
      selectFirst: 'กรุณาเลือกประเภทผู้ใช้และภาษาก่อน'
    },
    en: {
      selectLanguage: 'Select Language',
      thai: 'Thai',
      english: 'English',
      selectUserType: 'Select User Type',
      userType: 'User Type',
      customer: 'Customer',
      employee: 'Employee',
      partner: 'Partner',
      personalInfo: 'Personal Information',
      title: 'Title',
      name: 'Name',
      surname: 'Surname',
      idPassportNumber: 'ID/Passport Number',
      next: 'Next',
      back: 'Back',
      idPassport: 'ID/Passport Number',
      enterIdPassport: 'Enter ID or Passport number',
      email: 'Email',
      phone: 'Phone',
      consentPolicy: 'Consent Policy',
      step: 'Step',
      version: 'Version',
      iAgree: 'I agree to the terms and privacy policy',
      accept: 'Accept',
      selectTitle: 'Select Title',
      pleaseSelect: 'Please select',
      selectFirst: 'Please select user type and language first'
    }
  };

  // Set user type from URL and handle initial step
  useEffect(() => {
    if (userType) {
      // Accept any userType as valid - for future extensibility
      const cleanUserType = userType.toLowerCase().trim();
      setSelectedUserType(cleanUserType);
      
      // Customer type without language should redirect to language selection
      if (cleanUserType === 'customer' && !urlLang) {
        navigate('/consent/select-language');
        return;
      }
      
      // All types should have language from URL
      if (urlLang) {
        setLanguage(urlLang);
      } else if (cleanUserType !== 'customer') {
        // Non-customer types must have language in URL
        console.error('Language parameter missing for non-customer type');
      }
    }
  }, [userType, urlLang, navigate]);

  // Load titles from backend - updated API endpoint
  const loadTitles = async () => {
    setLoadingTitles(true);
    try {
      const response = await axios.get(`https://consent-back.onrender.com/api/titles`);
      if (response.data && response.data.success && response.data.data) {
        setTitles(response.data.data);
      } else {
        setTitles([
          { id: 1, title_th: 'นาย', title_en: 'Mr.' },
          { id: 2, title_th: 'นาง', title_en: 'Mrs.' },
          { id: 3, title_th: 'นางสาว', title_en: 'Ms.' }
        ]);
      }
    } catch (error) {
      console.error('Error loading titles:', error);
      setTitles([
        { id: 1, title_th: 'นาย', title_en: 'Mr.' },
        { id: 2, title_th: 'นาง', title_en: 'Mrs.' },
        { id: 3, title_th: 'นางสาว', title_en: 'Ms.' }
      ]);
    } finally {
      setLoadingTitles(false);
    }
  };

  // Load form fields from backend
  const loadFormFields = async () => {
    try {
      const response = await axios.get(`https://consent-back.onrender.com/api/form-fields`);
      if (response.data && response.data.success && response.data.data) {
        setFormFields(response.data.data);
      }
    } catch (error) {
      console.error('Error loading form fields:', error);
    }
  };

  // Load consent content based on user type and language
  const loadConsentContent = async () => {
    try {
      setLoading(true);
      const currentUserType = selectedUserType || 'customer';
      const currentLang = language === 'th' ? 'th-TH' : 'en-US';
      
      // Get policy from simple-policy API
      const response = await axios.get(
        `https://consent-back.onrender.com/api/simple-policy/active?userType=${currentUserType}&language=${currentLang}`
      );

      if (response.data && response.data.data) {
        const policyData = response.data.data;
        setPolicyContent({
          id: policyData.id,
          title: policyData.title || 'Consent Policy',
          content: policyData.content || policyData.policy_content || '',
          version: policyData.version || '1.0',
          userType: policyData.user_type || currentUserType
        });
      } else if (response.data && response.data.success === false) {
        console.warn('No policy found:', response.data.message);
        throw new Error(response.data.message || 'No policy data received');
      } else {
        throw new Error('No policy data received');
      }
    } catch (err) {
      console.error('Error loading policy:', err);
      setPolicyContent({
        title: language === 'th' ? 'นโยบายความยินยอม' : 'Consent Policy',
        content: language === 'th' 
          ? '<p>ไม่สามารถโหลดเนื้อหานโยบายได้ กรุณาลองใหม่อีกครั้ง</p>' 
          : '<p>Unable to load policy content. Please try again.</p>',
        version: '1.0'
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate Thai ID card checksum
  const validateThaiID = (id) => {
    if (!id || id.length !== 13) return false;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id.charAt(i)) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(id.charAt(12));
  };

  // Validate passport format (alphanumeric)
  const validatePassport = (passport) => {
    if (!passport || passport.length < 6 || passport.length > 20) return false;
    return /^[A-Z0-9]+$/i.test(passport);
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};
    
    
    if (!formData.nameSurname || formData.nameSurname.trim().length < 2) {
      newErrors.nameSurname = language === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Please enter name and surname';
    }
    
    // Check ID/Passport based on language
    if (language === 'th') {
      // Thai language - require Thai ID card (exactly 13 digits)
      if (!formData.idPassportNumber || formData.idPassportNumber.trim().length !== 13) {
        newErrors.idPassportNumber = 'กรุณากรอกเลขบัตรประชาชน 13 หลัก';
      } else if (!/^\d{13}$/.test(formData.idPassportNumber)) {
        newErrors.idPassportNumber = 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก';
      } else if (!validateThaiID(formData.idPassportNumber)) {
        newErrors.idPassportNumber = 'เลขบัตรประชาชนไม่ถูกต้อง';
      }
    } else {
      // English language - require passport (alphanumeric)
      if (!formData.idPassportNumber || formData.idPassportNumber.trim().length < 6) {
        newErrors.idPassportNumber = 'Please enter passport number (at least 6 characters)';
      } else if (!validatePassport(formData.idPassportNumber)) {
        newErrors.idPassportNumber = 'Passport must contain only letters and numbers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next button
  const handleLanguageSelect = (selectedLang) => {
    // Redirect to the same URL with language parameter
    window.location.href = `/consent/${userType}?lang=${selectedLang}`;
  };

  // Handle next button in form step
  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep(3);
    }
  };

  // Handle accept consent
  const handleAccept = async () => {
    if (!agreed) return;
    
    setLoading(true);
    setSubmitStatus(null);
    
    try {
      // Get browser information
      const userAgent = navigator.userAgent;
      const browserInfo = (() => {
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';
        return 'Other';
      })();
      
      // Split name and surname properly
      const nameParts = formData.nameSurname.trim().split(' ');
      const firstName = nameParts[0] || '';
      let surname = nameParts.slice(1).join(' ');
      
      // If no surname provided, use a placeholder or duplicate the first name
      if (!surname || surname.trim() === '') {
        surname = firstName; // Use first name as surname if not provided
      }
      
      // Accept any userType - no validation needed for future extensibility
      let finalUserType = selectedUserType || 'customer';
      finalUserType = finalUserType.toLowerCase().trim();
      
      const payload = {
        name: firstName,
        surname: surname,
        nameSurname: formData.nameSurname, // Also send combined for compatibility
        idPassport: formData.idPassportNumber,
        email: formData.email || '',
        phone: formData.phone || '',
        userType: finalUserType, // Send any userType as-is
        consentVersion: policyContent?.version || '1.0',
        language: language,
        consentGiven: true,
        consentDate: new Date().toISOString(),
        policyId: policyContent?.id || null,
        policyTitle: policyContent?.title || 'Consent Policy',
        policyVersion: policyContent?.version || '1.0'
      };

      // Submit to correct endpoint
      const response = await axios.post('https://consent-back.onrender.com/api/consent/submit', payload);
      
      if (response.data && response.data.success) {
        setCurrentStep(4);
        setSubmitStatus({
          type: 'success',
          message: language === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 'Successfully saved'
        });
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting consent:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 
                (language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' : 'Error saving data')
      });
    } finally {
      setLoading(false);
    }
  };

  // Load titles when language changes
  useEffect(() => {
    if (language) {
      loadTitles();
    }
  }, [language]);

  // Load form fields on mount
  useEffect(() => {
    loadFormFields();
  }, []);

  // Load consent content based on user type and language
  useEffect(() => {
    if (selectedUserType && language) {
      loadConsentContent();
    }
  }, [selectedUserType, language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Admin Link */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Admin Panel
          </button>
        </div>

        {/* Language selector - Only show for customer type */}
        {selectedUserType === 'customer' && currentStep > 1 && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-4 py-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <div className="language-selector">
                <button 
                  className={`lang-btn ${language === 'th' ? 'active' : ''}`}
                  onClick={() => setLanguage('th')}
                >
                  ไทย
                </button>
                <button 
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}

        
        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-lg bg-opacity-95 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {language === 'th' ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {t[language].step} 1/3
              </div>
            </div>

            <div className="space-y-4">

              {/* Name and Surname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'th' ? 'ชื่อ-นามสกุล' : 'Name-Surname'}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  value={formData.nameSurname}
                  onChange={(e) => setFormData({...formData, nameSurname: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'th' ? 'กรอกชื่อและนามสกุล' : 'Enter name and surname'}
                />
                {errors.nameSurname && <p className="text-red-500 text-sm mt-1">{errors.nameSurname}</p>}
              </div>

              {/* ID/Passport with validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'th' ? 'เลขบัตรประชาชน' : 'Passport Number'}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  value={formData.idPassportNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (language === 'th') {
                      // Thai - only allow 13 digits
                      if (/^\d{0,13}$/.test(value)) {
                        setFormData({...formData, idPassportNumber: value});
                      }
                    } else {
                      // English - allow alphanumeric for passport
                      if (/^[A-Z0-9]{0,20}$/i.test(value)) {
                        setFormData({...formData, idPassportNumber: value.toUpperCase()});
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'th' ? 'กรอกเลขบัตรประชาชน 13 หลัก' : 'Enter passport number'}
                  maxLength={language === 'th' ? 13 : 20}
                />
                {errors.idPassportNumber && <p className="text-red-500 text-sm mt-1">{errors.idPassportNumber}</p>}
                {language === 'th' && formData.idPassportNumber.length === 13 && !errors.idPassportNumber && (
                  <p className="text-green-600 text-sm mt-1">✓ รูปแบบเลขบัตรประชาชนถูกต้อง</p>
                )}
                {language === 'en' && formData.idPassportNumber.length >= 6 && !errors.idPassportNumber && (
                  <p className="text-green-600 text-sm mt-1">✓ Valid passport format</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                {t[language].next}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Consent Policy */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-lg bg-opacity-95 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {t[language].consentPolicy}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                {t[language].step} 3/4
              </div>
            </div>

            {/* Version badges */}
            {policyContent && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {language === 'th' ? 'เวอร์ชัน' : 'Version'}: {policyContent.version}
                </span>
              </div>
            )}

            {/* Content area */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              {loadingPolicy ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : policyContent ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {policyContent.title}
                    </h3>
                    <div className="text-sm text-gray-600 mb-2">
                      {t[language].version}: {policyContent.version} | 
                      {t[language].userType}: {selectedUserType || 'customer'}
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {typeof policyContent.content === 'string' ? (
                        policyContent.content.includes('<') ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: policyContent.content }}
                            className="policy-content whitespace-pre-wrap [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>p]:whitespace-pre-wrap [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>li]:mb-2 [&>li]:whitespace-pre-wrap [&>strong]:font-bold [&>em]:italic [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:whitespace-pre-wrap [&>hr]:my-6 [&>hr]:border-gray-300 [&_*]:whitespace-pre-wrap"
                          />
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{policyContent.content}</div>
                        )
                      ) : (
                        <div>No content available</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {t[language].iAgree}
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {t[language].selectFirst || 'Please select user type and language first'}
                </div>
              )}
            </div>

            {/* Action buttons */}
            {policyContent && (
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
                >
                  {t[language].back}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!agreed || loading}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t[language].accept}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-lg bg-opacity-95 border border-white/20">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {language === 'th' ? 'บันทึกข้อมูลสำเร็จ' : 'Successfully Saved'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'th' ? 'ข้อมูลความยินยอมของคุณได้รับการบันทึกเรียบร้อยแล้ว' : 'Your consent information has been saved successfully.'}
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                {language === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
              </button>
            </div>
          </div>
        )}

        {/* Error/Status Messages */}
        {submitStatus && submitStatus.type === 'error' && currentStep === 3 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{submitStatus.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentFlowPage;
