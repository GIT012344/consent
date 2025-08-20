import React, { useState, useEffect } from 'react';
import { 
  Target, Save, Plus, Trash2, Edit2, Users, 
  FileText, ChevronRight, Globe, Briefcase, UserCheck 
} from 'lucide-react';
import { consentAPI } from '../services/api';

const VersionTargeting = () => {
  const [versions, setVersions] = useState([]);
  const [targetingRules, setTargetingRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // User type options
  const userTypes = [
    { value: 'customer', label: 'ลูกค้าทั่วไป', labelEn: 'Customer', icon: '👤', color: 'blue' },
    { value: 'employee', label: 'พนักงาน', labelEn: 'Employee', icon: '💼', color: 'green' },
    { value: 'partner', label: 'พาร์ทเนอร์', labelEn: 'Partner', icon: '🤝', color: 'purple' }
  ];
  
  // Language options
  const languages = [
    { value: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    fetchVersions();
    fetchTargetingRules();
  }, []);

  const fetchVersions = async () => {
    try {
      const response = await consentAPI.getConsentVersions();
      // Ensure versions is always an array
      const versionsData = Array.isArray(response.data) ? response.data : 
                          (response.data?.versions ? response.data.versions : []);
      setVersions(versionsData);
    } catch (error) {
      console.error('Error fetching versions:', error);
      setVersions([]); // Set empty array on error
    }
  };

  const fetchTargetingRules = async () => {
    // Mock data for now
    const mockRules = [
      {
        id: 1,
        userType: 'customer',
        language: 'th',
        versionId: 1,
        version: '1.0',
        isActive: true
      },
      {
        id: 2,
        userType: 'customer',
        language: 'en',
        versionId: 2,
        version: '1.0 EN',
        isActive: true
      },
      {
        id: 3,
        userType: 'employee',
        language: 'th',
        versionId: 3,
        version: '2.0',
        isActive: true
      },
      {
        id: 4,
        userType: 'partner',
        language: 'th',
        versionId: 4,
        version: '1.5',
        isActive: true
      }
    ];
    setTargetingRules(mockRules);
  };

  const handleSaveRule = async () => {
    setLoading(true);
    try {
      // API call to save rule
      console.log('Saving rule:', selectedRule);
      
      // Update local state
      if (selectedRule.id) {
        setTargetingRules(rules => 
          rules.map(r => r.id === selectedRule.id ? selectedRule : r)
        );
      } else {
        setTargetingRules(rules => [...rules, { ...selectedRule, id: Date.now() }]);
      }
      
      setShowModal(false);
      setSelectedRule(null);
    } catch (error) {
      console.error('Error saving rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm('ต้องการลบกฎนี้หรือไม่?')) {
      setTargetingRules(rules => rules.filter(r => r.id !== id));
    }
  };

  const openRuleModal = (rule = null) => {
    setSelectedRule(rule || {
      userType: 'customer',
      language: 'th',
      versionId: versions[0]?.id || 1,
      isActive: true
    });
    setShowModal(true);
  };

  const getUserTypeInfo = (value) => {
    return userTypes.find(t => t.value === value) || userTypes[0];
  };

  const getLanguageInfo = (value) => {
    return languages.find(l => l.value === value) || languages[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <Target size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Version Targeting</h1>
                <p className="text-sm text-gray-500">กำหนด Consent Version สำหรับแต่ละกลุ่มผู้ใช้</p>
              </div>
            </div>
            
            <button
              onClick={() => openRuleModal()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>เพิ่มกฎใหม่</span>
            </button>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetingRules.map((rule) => {
            const userType = getUserTypeInfo(rule.userType);
            const language = getLanguageInfo(rule.language);
            
            return (
              <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${userType.color}-50 rounded-xl flex items-center justify-center text-2xl`}>
                    {userType.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openRuleModal(rule)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ประเภทผู้ใช้</p>
                    <p className="font-medium text-gray-800">{userType.label}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ภาษา</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium text-gray-800">{language.label}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Version</p>
                    <div className="flex items-center space-x-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        v{rule.version}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rule.isActive 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {targetingRules.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">ยังไม่มีกฎการ Targeting</h3>
            <p className="text-sm text-gray-500 mb-6">เริ่มต้นโดยการเพิ่มกฎใหม่สำหรับแต่ละกลุ่มผู้ใช้</p>
            <button
              onClick={() => openRuleModal()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              เพิ่มกฎแรก
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {selectedRule?.id ? 'แก้ไขกฎ' : 'เพิ่มกฎใหม่'}
            </h3>
            
            <div className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทผู้ใช้
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {userTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedRule({ ...selectedRule, userType: type.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRule?.userType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ภาษา
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setSelectedRule({ ...selectedRule, language: lang.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedRule?.language === lang.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{lang.flag}</div>
                      <div className="text-sm font-medium">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Version Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consent Version
                </label>
                <select
                  value={selectedRule?.versionId || ''}
                  onChange={(e) => {
                    const version = versions.find(v => v.id === parseInt(e.target.value));
                    setSelectedRule({ 
                      ...selectedRule, 
                      versionId: parseInt(e.target.value),
                      version: version?.version || '1.0'
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือก Version...</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      v{version.version} - {version.title || version.description}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedRule?.isActive || false}
                  onChange={(e) => setSelectedRule({ ...selectedRule, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  เปิดใช้งานกฎนี้
                </label>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveRule}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>บันทึก</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionTargeting;
