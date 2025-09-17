// Clear all browser storage to fix 431 error
export const clearAllStorage = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Clear IndexedDB
  if (window.indexedDB) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
      });
    }).catch(e => console.log('IndexedDB clear error:', e));
  }
  
  console.log('✅ All storage cleared!');
};

// Auto clear on load if storage is too large
const checkAndClearStorage = () => {
  try {
    const storageSize = new Blob(Object.values(localStorage)).size;
    if (storageSize > 2000) {
      console.log('Storage too large, clearing...');
      clearAllStorage();
      return true;
    }
  } catch (e) {
    console.log('Storage check error:', e);
  }
  return false;
};

// Export for use in other files
export default checkAndClearStorage;
