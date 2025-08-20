// ฟังก์ชันช่วยเหลือต่างๆ

// จัดรูปแบบวันที่
export const formatDate = (dateString, locale = 'th-TH') => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(locale, options);
};

// จัดรูปแบบวันที่แบบสั้น
export const formatDateShort = (dateString, locale = 'th-TH') => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(locale);
};

// ดาวน์โหลดไฟล์
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// สร้างชื่อไฟล์สำหรับ export
export const generateExportFilename = (type, startDate, endDate) => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  
  let filename = `consent-data-${timestamp}`;
  
  if (startDate && endDate) {
    const start = new Date(startDate).toISOString().slice(0, 10);
    const end = new Date(endDate).toISOString().slice(0, 10);
    filename = `consent-data-${start}-to-${end}-${timestamp}`;
  }
  
  return `${filename}.${type}`;
};

// แปลงข้อความตามภาษา
export const getLocalizedText = (textObj, language = 'th') => {
  if (typeof textObj === 'string') return textObj;
  return textObj[language] || textObj.th || textObj.en || '';
};

// ตรวจสอบว่าเป็น mobile หรือไม่
export const isMobile = () => {
  return window.innerWidth <= 768;
};

// คัดลอกข้อความไปยัง clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback สำหรับ browser เก่า
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// สร้าง query string จาก object
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  
  return searchParams.toString();
};

// แปลงข้อมูลสถิติเป็นรูปแบบที่ใช้งานง่าย
export const processStatsData = (statsData) => {
  if (!statsData) return null;
  
  return {
    total: statsData.total || 0,
    byType: statsData.byType?.map(item => ({
      type: item.consent_type,
      count: parseInt(item.count),
      label: getConsentTypeLabel(item.consent_type)
    })) || [],
    byLanguage: statsData.byLanguage?.map(item => ({
      language: item.consent_language,
      count: parseInt(item.count),
      label: getLanguageLabel(item.consent_language)
    })) || [],
    byDate: statsData.byDate || []
  };
};

// ได้ label ของประเภทความยินยอม
export const getConsentTypeLabel = (type, language = 'th') => {
  const labels = {
    customer: { th: 'ลูกค้า', en: 'Customer' },
    employee: { th: 'พนักงาน', en: 'Employee' },
    partner: { th: 'พันธมิตร', en: 'Partner' }
  };
  
  return labels[type]?.[language] || type;
};

// ได้ label ของภาษา
export const getLanguageLabel = (lang) => {
  const labels = {
    th: 'ไทย',
    en: 'English'
  };
  
  return labels[lang] || lang;
};

// แปลงสีตามประเภทความยินยอม
export const getConsentTypeColor = (type) => {
  const colors = {
    customer: 'bg-blue-100 text-blue-800',
    employee: 'bg-green-100 text-green-800',
    partner: 'bg-purple-100 text-purple-800'
  };
  
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// แปลงสีตามภาษา
export const getLanguageColor = (language) => {
  const colors = {
    th: 'bg-orange-100 text-orange-800',
    en: 'bg-indigo-100 text-indigo-800'
  };
  
  return colors[language] || 'bg-gray-100 text-gray-800';
};

// ตรวจสอบว่าข้อมูลว่างหรือไม่
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// สร้าง unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
