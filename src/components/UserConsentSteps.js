import React, { useState } from 'react';
import { Check, ChevronRight, User, Globe, CheckCircle, Download, Mail, FileText } from 'lucide-react';

export const StepIndicator = ({ currentStep, audiences }) => (
  <div className="flex justify-center mb-8">
    <div className="flex items-center space-x-2">
      {['Audience', 'Language', 'Consent', 'Information', 'Complete'].map((step, idx) => {
        if (idx === 0 && audiences.length === 1) return null;
        
        const actualIdx = audiences.length === 1 ? idx - 1 : idx;
        const isActive = actualIdx === currentStep;
        const isCompleted = actualIdx < currentStep;
        
        return (
          <React.Fragment key={idx}>
            {idx > 0 && audiences.length > 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${isActive ? 'bg-blue-600 text-white' : 
                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {isCompleted ? <Check className="w-4 h-4" /> : actualIdx + 1}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export const AudienceStep = ({ audiences, formData, setFormData, setCurrentStep }) => (
  <div className="max-w-md mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">
      {formData.language === 'th' ? 'คุณคือใคร?' : 'Who are you?'}
    </h2>
    <div className="space-y-3">
      {audiences.map(audience => (
        <button
          key={audience}
          onClick={() => {
            setFormData(prev => ({ ...prev, audience }));
            setCurrentStep(1);
          }}
          className="w-full p-4 text-left border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">
                {audience === 'customer' ? (formData.language === 'th' ? 'ลูกค้า' : 'Customer') :
                 audience === 'employee' ? (formData.language === 'th' ? 'พนักงาน' : 'Employee') :
                 audience === 'partner' ? (formData.language === 'th' ? 'พาร์ทเนอร์' : 'Partner') :
                 audience}
              </div>
              <div className="text-sm text-gray-600">
                {audience === 'customer' ? (formData.language === 'th' ? 'ลูกค้าทั่วไป' : 'General Customer') :
                 audience === 'employee' ? (formData.language === 'th' ? 'พนักงานภายใน' : 'Internal Staff') :
                 audience === 'partner' ? (formData.language === 'th' ? 'พันธมิตรทางธุรกิจ' : 'Business Partner') :
                 ''}
              </div>
            </div>
            <User className="w-5 h-5 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

export const LanguageStep = ({ formData, setFormData, setCurrentStep, loadConsentVersion }) => (
  <div className="max-w-md mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">
      {formData.language === 'th' ? 'เลือกภาษา' : 'Select Language'}
    </h2>
    <div className="space-y-3">
      <button
        onClick={() => {
          setFormData(prev => ({ ...prev, language: 'th' }));
          setCurrentStep(2);
          loadConsentVersion();
        }}
        className={`w-full p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors
          ${formData.language === 'th' ? 'border-blue-500 bg-blue-50' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">ภาษาไทย</div>
            <div className="text-sm text-gray-600">Thai Language</div>
          </div>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
      </button>
      
      <button
        onClick={() => {
          setFormData(prev => ({ ...prev, language: 'en' }));
          setCurrentStep(2);
          loadConsentVersion();
        }}
        className={`w-full p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors
          ${formData.language === 'en' ? 'border-blue-500 bg-blue-50' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">English</div>
            <div className="text-sm text-gray-600">ภาษาอังกฤษ</div>
          </div>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
      </button>
    </div>
  </div>
);

export const ConsentStep = ({ consentVersion, formData, setFormData, setCurrentStep, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!consentVersion) {
    return <div className="text-center py-8 text-red-600">ไม่พบข้อมูล consent</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {consentVersion.title}
      </h2>
      
      <div 
        id="consent-content"
        className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: consentVersion.content }}
      />
      
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="accept-consent"
          checked={formData.acceptTerms}
          onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
          className="mr-3 w-4 h-4"
        />
        <label htmlFor="accept-consent" className="text-sm">
          {formData.language === 'th' 
            ? 'ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขข้างต้น' 
            : 'I have read and accept the terms above'}
        </label>
      </div>
      
      <button
        onClick={() => setCurrentStep(3)}
        disabled={!formData.acceptTerms}
        className={`w-full py-3 rounded-lg font-medium transition-colors
          ${formData.acceptTerms 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {formData.language === 'th' ? 'ถัดไป' : 'Next'}
      </button>
    </div>
  );
};

export const InformationStep = ({ formData, setFormData, error, handleSubmit, setCurrentStep, loading, detectIDType }) => {
  const isEnglish = formData.language === 'en';
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isEnglish ? 'Your Information' : 'ข้อมูลของคุณ'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isEnglish ? 'Title' : 'คำนำหน้า'}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={isEnglish ? 'Mr./Ms./Mrs.' : 'นาย/นาง/นางสาว'}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {isEnglish ? 'First Name' : 'ชื่อ'}
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {isEnglish ? 'Last Name' : 'นามสกุล'}
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {isEnglish ? 'ID Type' : 'ประเภทเอกสาร'}
          </label>
          <input
            type="text"
            value={formData.idType === 'thai_id' ? (isEnglish ? 'Thai ID' : 'บัตรประชาชน') : 'Passport'}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              if (value.includes('thai') || value.includes('บัตร') || value.includes('ประชาชน')) {
                setFormData(prev => ({ ...prev, idType: 'thai_id' }));
              } else if (value.includes('pass')) {
                setFormData(prev => ({ ...prev, idType: 'passport' }));
              }
            }}
            placeholder={isEnglish ? 'Thai ID / Passport' : 'บัตรประชาชน / Passport'}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {formData.idType === 'thai_id' 
              ? (isEnglish ? 'ID Card Number' : 'เลขบัตรประชาชน')
              : (isEnglish ? 'Passport Number' : 'เลข Passport')}
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => {
              const value = e.target.value;
              const detectedType = detectIDType(value);
              setFormData(prev => ({ 
                ...prev, 
                idNumber: value,
                idType: detectedType
              }));
            }}
            placeholder={formData.idType === 'thai_id' ? '1234567890123' : 'AB123456'}
            maxLength={formData.idType === 'thai_id' ? 13 : 12}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.idType === 'thai_id' 
              ? (isEnglish ? '13-digit Thai ID number' : 'เลขบัตรประชาชน 13 หลัก')
              : (isEnglish ? '6-12 characters (A-Z, 0-9)' : 'ตัวอักษร A-Z และตัวเลข 6-12 หลัก')}
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="confirm-info"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
            className="mr-3 w-4 h-4"
          />
          <label htmlFor="confirm-info" className="text-sm">
            {isEnglish 
              ? 'I confirm that the information provided is correct' 
              : 'ข้าพเจ้ายืนยันว่าข้อมูลถูกต้อง'}
          </label>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.acceptTerms}
          className={`w-full py-3 rounded-lg font-medium transition-colors
            ${formData.acceptTerms && !loading
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {loading ? (isEnglish ? 'Processing...' : 'กำลังดำเนินการ...') : (isEnglish ? 'Accept' : 'ยอมรับ')}
        </button>
        
        <button
          onClick={() => setCurrentStep(2)}
          className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          {isEnglish ? 'Back' : 'ย้อนกลับ'}
        </button>
      </div>
    </div>
  );
};

export const SuccessStep = ({ consentResult, formData }) => {
  const isEnglish = formData.language === 'en';
  
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Consent Receipt - ${consentResult?.consentId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .consent-id { color: #2563eb; font-size: 24px; font-weight: bold; }
            .info-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { margin: 10px 0; }
            .label { color: #6b7280; font-size: 14px; }
            .value { font-size: 16px; font-weight: 500; margin-top: 4px; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isEnglish ? 'Consent Receipt' : 'ใบรับการยินยอม'}</h1>
          </div>
          <div class="info-section">
            <div class="info-row">
              <div class="label">${isEnglish ? 'Consent ID' : 'รหัสการยินยอม'}</div>
              <div class="consent-id">${consentResult?.consentId}</div>
            </div>
            <div class="info-row">
              <div class="label">${isEnglish ? 'Name' : 'ชื่อ-นามสกุล'}</div>
              <div class="value">${formData.title} ${formData.firstName} ${formData.lastName}</div>
            </div>
            <div class="info-row">
              <div class="label">${isEnglish ? 'Date & Time' : 'วันที่และเวลา'}</div>
              <div class="value">${new Date(consentResult?.acceptedAt).toLocaleString('th-TH', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            <div class="info-row">
              <div class="label">${isEnglish ? 'Policy Version' : 'เวอร์ชันนโยบาย'}</div>
              <div class="value">${consentResult?.policyVersion || '1.0'}</div>
            </div>
          </div>
          <div class="footer">
            <p>${isEnglish ? 'This is an official consent receipt' : 'นี่คือใบรับการยินยอมอย่างเป็นทางการ'}</p>
            <p>${isEnglish ? 'Please keep this for your records' : 'กรุณาเก็บไว้เป็นหลักฐาน'}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  const handleDownloadPDF = () => {
    // Generate simple HTML receipt for download
    const content = `
      <h1>${isEnglish ? 'Consent Receipt' : 'ใบรับการยินยอม'}</h1>
      <p><strong>${isEnglish ? 'Consent ID:' : 'รหัสการยินยอม:'}</strong> ${consentResult?.consentId}</p>
      <p><strong>${isEnglish ? 'Name:' : 'ชื่อ:'}</strong> ${formData.title} ${formData.firstName} ${formData.lastName}</p>
      <p><strong>${isEnglish ? 'Date:' : 'วันที่:'}</strong> ${new Date(consentResult?.acceptedAt).toLocaleString('th-TH')}</p>
      <p><strong>${isEnglish ? 'Policy Version:' : 'เวอร์ชัน:'}</strong> ${consentResult?.policyVersion || '1.0'}</p>
    `;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent_receipt_${consentResult?.consentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!consentResult) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
      </div>
      
      <h2 className="text-2xl font-bold mb-4">
        {isEnglish ? 'Consent Accepted Successfully' : 'ยอมรับเงื่อนไขเรียบร้อยแล้ว'}
      </h2>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600">
              {isEnglish ? 'Consent ID' : 'รหัสการยินยอม'}
            </div>
            <div className="text-xl font-bold text-blue-600">
              {consentResult.consentId}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">
              {isEnglish ? 'Date & Time' : 'วันที่และเวลา'}
            </div>
            <div className="font-medium">
              {new Date(consentResult.acceptedAt).toLocaleString('th-TH', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">
              {isEnglish ? 'Policy Version' : 'เวอร์ชันนโยบาย'}
            </div>
            <div className="font-medium">
              {consentResult.policyVersion || '1.0'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={handleDownloadPDF}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" />
          {isEnglish ? 'Download Receipt' : 'ดาวน์โหลดใบรับ'}
        </button>
        
        <button 
          onClick={handlePrint}
          className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
        >
          <FileText className="w-5 h-5 mr-2" />
          {isEnglish ? 'Print Receipt' : 'พิมพ์ใบรับ'}
        </button>
      </div>
    </div>
  );
};
