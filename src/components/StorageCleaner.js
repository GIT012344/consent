import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const StorageCleaner = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [cleared, setCleared] = useState(false);

  const checkStorage = () => {
    let totalSize = 0;
    const items = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        const size = new Blob([item]).size;
        totalSize += size;
        items[key] = size;
      }
    }
    
    setStorageInfo({
      totalSize: (totalSize / 1024).toFixed(2),
      itemCount: Object.keys(items).length,
      items
    });
  };

  const clearAll = () => {
    // Clear localStorage except language
    const language = localStorage.getItem('language');
    localStorage.clear();
    if (language) {
      localStorage.setItem('language', language);
    }
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    setCleared(true);
    checkStorage();
    
    // Auto hide success message
    setTimeout(() => setCleared(false), 3000);
  };

  useEffect(() => {
    checkStorage();
  }, []);

  if (!storageInfo) return null;

  const isLarge = parseFloat(storageInfo.totalSize) > 10;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isLarge && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2 max-w-xs">
          <div className="flex items-center text-yellow-800">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Storage Warning</p>
              <p className="text-xs mt-1">
                Storage size ({storageInfo.totalSize} KB) may cause issues
              </p>
            </div>
          </div>
        </div>
      )}
      
      {cleared && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2 max-w-xs">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Storage cleared successfully!</span>
          </div>
        </div>
      )}
      
      <button
        onClick={clearAll}
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm hover:bg-gray-50 transition-colors group"
        title={`Storage: ${storageInfo.totalSize} KB (${storageInfo.itemCount} items)`}
      >
        <div className="flex items-center space-x-2">
          <Trash2 className={`w-4 h-4 ${isLarge ? 'text-yellow-600' : 'text-gray-600'} group-hover:text-red-600`} />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            Clear Storage
          </span>
        </div>
      </button>
    </div>
  );
};

export default StorageCleaner;
