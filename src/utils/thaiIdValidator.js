/**
 * Thai National ID Card Validation with Checksum
 * Algorithm: MOD-11 with weights
 */

export const validateThaiId = (idNumber) => {
  // Remove spaces and dashes
  const cleaned = idNumber.replace(/[\s-]/g, '');
  
  // Check if exactly 13 digits
  if (!/^\d{13}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Thai ID must be exactly 13 digits'
    };
  }
  
  // Calculate checksum using MOD-11
  const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = (11 - remainder) % 10;
  
  if (checkDigit !== parseInt(cleaned[12])) {
    return {
      valid: false,
      error: 'Invalid Thai ID checksum'
    };
  }
  
  return {
    valid: true,
    formatted: cleaned.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')
  };
};

export const validatePassport = (passport) => {
  // Remove spaces
  const cleaned = passport.replace(/\s/g, '').toUpperCase();
  
  // Check format: 6-12 alphanumeric characters
  if (!/^[A-Z0-9]{6,12}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Passport must be 6-12 alphanumeric characters'
    };
  }
  
  return {
    valid: true,
    formatted: cleaned
  };
};

export const maskIdNumber = (idNumber, idType = 'thai_id') => {
  if (!idNumber || idNumber.length < 4) return '****';
  
  const last4 = idNumber.slice(-4);
  
  if (idType === 'thai_id') {
    return `*-****-*****-**-${last4.slice(-1)}`;
  } else {
    return '*'.repeat(idNumber.length - 4) + last4;
  }
};

export const hashIdNumber = (idNumber, salt) => {
  // This is a placeholder - in production, use proper crypto library
  // For now, we'll use a simple hash for demonstration
  const crypto = window.crypto || window.msCrypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + idNumber);
  
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
};
