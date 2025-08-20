// ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล

export const validateForm = (data) => {
  const errors = [];

  // ตรวจสอบคำนำหน้า
  if (!data.title || data.title.trim() === '') {
    errors.push('กรุณาเลือกคำนำหน้า');
  }

  // ตรวจสอบชื่อ-นามสกุล
  if (!data.nameSurname || data.nameSurname.trim().length < 2) {
    errors.push('กรุณากรอกชื่อ-นามสกุล (อย่างน้อย 2 ตัวอักษร)');
  }

  // ตรวจสอบเลขบัตรประชาชน/Passport
  if (!data.idPassport || data.idPassport.trim().length < 8) {
    errors.push('กรุณากรอกเลขบัตรประชาชน/Passport (อย่างน้อย 8 ตัวอักษร)');
  }

  // ตรวจสอบภาษา
  if (!data.language || !['th', 'en'].includes(data.language)) {
    errors.push('กรุณาเลือกภาษา');
  }

  // ตรวจสอบประเภทความยินยอม
  if (!data.consentType || !['customer', 'employee', 'partner'].includes(data.consentType)) {
    errors.push('กรุณาเลือกประเภทความยินยอม');
  }

  return errors;
};

// ตรวจสอบเลขบัตรประชาชนไทย (13 หลัก)
export const validateThaiID = (id) => {
  if (!id || id.length !== 13) return false;
  
  // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
  if (!/^\d{13}$/.test(id)) return false;
  
  // คำนวณเลขตรวจสอบ
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === parseInt(id.charAt(12));
};

// ตรวจสอบรูปแบบ Passport
export const validatePassport = (passport) => {
  if (!passport) return false;
  
  // Passport ต้องมีความยาว 6-9 ตัวอักษร และเป็นตัวอักษรและตัวเลข
  const passportRegex = /^[A-Z0-9]{6,9}$/;
  return passportRegex.test(passport.toUpperCase());
};

// ตรวจสอบว่าเป็นเลขบัตรประชาชนไทยหรือ Passport
export const validateIDOrPassport = (value) => {
  if (!value) return { valid: false, type: null };
  
  const cleanValue = value.replace(/\s+/g, '').toUpperCase();
  
  // ถ้าเป็นตัวเลข 13 หลัก ให้ตรวจสอบเป็นบัตรประชาชนไทย
  if (/^\d{13}$/.test(cleanValue)) {
    return {
      valid: validateThaiID(cleanValue),
      type: 'thai_id',
      formatted: cleanValue
    };
  }
  
  // ถ้าไม่ใช่ ให้ตรวจสอบเป็น Passport
  return {
    valid: validatePassport(cleanValue),
    type: 'passport',
    formatted: cleanValue
  };
};

// ฟังก์ชันจัดรูปแบบเลขบัตรประชาชน
export const formatThaiID = (id) => {
  if (!id) return '';
  const cleanID = id.replace(/\D/g, '');
  if (cleanID.length <= 13) {
    return cleanID.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
  }
  return cleanID;
};

// ฟังก์ชันทำความสะอาดข้อมูลก่อนส่ง
export const sanitizeFormData = (data) => {
  return {
    title: data.title?.trim() || '',
    nameSurname: data.nameSurname?.trim() || '',
    idPassport: data.idPassport?.replace(/\s+/g, '').toUpperCase() || '',
    language: data.language || 'th',
    consentType: data.consentType || 'customer'
  };
};

// ตัวเลือกสำหรับ dropdown
export const titleOptions = {
  th: [
    { value: 'นาย', label: 'นาย' },
    { value: 'นาง', label: 'นาง' },
    { value: 'นางสาว', label: 'นางสาว' }
  ],
  en: [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms.', label: 'Ms.' }
  ]
};

export const consentTypeOptions = {
  th: [
    { value: 'customer', label: 'ลูกค้า (Customer)' },
    { value: 'employee', label: 'พนักงาน (Employee)' },
    { value: 'partner', label: 'พันธมิตร (Partner)' }
  ],
  en: [
    { value: 'customer', label: 'Customer' },
    { value: 'employee', label: 'Employee' },
    { value: 'partner', label: 'Partner' }
  ]
};

export const languageOptions = [
  { value: 'th', label: 'ไทย (Thai)' },
  { value: 'en', label: 'English' }
];
