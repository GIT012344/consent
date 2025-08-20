// Utility to clear and check storage sizes
const clearStorage = {
  // Check size of localStorage
  checkSize: () => {
    let totalSize = 0;
    const items = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        const size = new Blob([item]).size;
        totalSize += size;
        items[key] = {
          size: size,
          preview: item?.substring(0, 100) + (item?.length > 100 ? '...' : '')
        };
      }
    }
    
    console.log('📊 LocalStorage Analysis:');
    console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log('Items:', items);
    return { totalSize, items };
  },
  
  // Clear specific keys that might be problematic
  clearLargeItems: () => {
    const keysToCheck = ['adminToken', 'adminUser', 'userData'];
    keysToCheck.forEach(key => {
      const item = localStorage.getItem(key);
      if (item && item.length > 1000) {
        console.log(`⚠️ Clearing large item: ${key} (${item.length} chars)`);
        localStorage.removeItem(key);
      }
    });
  },
  
  // Clear all except essential items
  clearNonEssential: () => {
    const essentialKeys = ['language', 'userData'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!essentialKeys.includes(key)) {
        console.log(`🗑️ Removing: ${key}`);
        localStorage.removeItem(key);
      }
    });
  },
  
  // Check cookies size
  checkCookies: () => {
    const cookies = document.cookie;
    const size = new Blob([cookies]).size;
    console.log(`🍪 Cookies Size: ${(size / 1024).toFixed(2)} KB`);
    return size;
  },
  
  // Clear all cookies
  clearCookies: () => {
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('✅ Cookies cleared');
  }
};

// Auto-run check on load
if (typeof window !== 'undefined') {
  clearStorage.checkSize();
  clearStorage.checkCookies();
  
  // If total size is too large, clear non-essential items
  const { totalSize } = clearStorage.checkSize();
  if (totalSize > 10000) { // > 10KB
    console.warn('⚠️ Storage size is large, clearing non-essential items');
    clearStorage.clearNonEssential();
  }
}

export default clearStorage;
