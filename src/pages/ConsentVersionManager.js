import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Save, Trash2, Edit2, CheckCircle, 
  XCircle, Users, Globe, Settings, Plus, Target,
  Eye, Download, Copy, Filter, Search
} from 'lucide-react';
import { consentAPI } from '../services/api';

const ConsentVersionManager = () => {
  const [versions, setVersions] = useState([]);
  const [targetingRules, setTargetingRules] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTargetingModal, setShowTargetingModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ userType: 'all', language: 'all', status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [versionForm, setVersionForm] = useState({
    version: '',
    title: '',
    description: '',
    language: 'th',
    userType: 'customer',
    file: null,
    content: ''
  });

  const userTypes = [
    { value: 'customer', label: 'ลูกค้าทั่วไป', icon: '👤', color: 'blue' },
    { value: 'employee', label: 'พนักงาน', icon: '💼', color: 'green' },
    { value: 'partner', label: 'พาร์ทเนอร์', icon: '🤝', color: 'purple' }
  ];

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
      setVersions(response.data || []);
    } catch (error) {
      // Mock data for demo
      setVersions([
        {
          id: 1,
          version: '1.0',
          title: 'Standard Consent',
          description: 'เอกสารความยินยอมมาตรฐานสำหรับลูกค้าทั่วไป',
          language: 'th',
          userType: 'customer',
          usageCount: 156,
          is_active: true,
          created_at: new Date('2024-01-15')
        },
        {
          id: 2,
          version: '1.0',
          title: 'Standard Consent (EN)',
          description: 'Standard consent form for general customers',
          language: 'en',
          userType: 'customer',
          usageCount: 42,
          is_active: true,
          created_at: new Date('2024-01-15')
        },
        {
          id: 3,
          version: '2.0',
          title: 'Employee Consent',
          description: 'เอกสารความยินยอมสำหรับพนักงาน',
          language: 'th',
          userType: 'employee',
          usageCount: 89,
          is_active: true,
          created_at: new Date('2024-02-01')
        }
      ]);
    }
  };

  const fetchTargetingRules = async () => {
    const mockRules = [
      { id: 1, userType: 'customer', language: 'th', versionId: 1 },
      { id: 2, userType: 'customer', language: 'en', versionId: 2 },
      { id: 3, userType: 'employee', language: 'th', versionId: 3 }
    ];
    setTargetingRules(mockRules);
  };

  const handleUploadVersion = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(versionForm).forEach(key => {
        if (versionForm[key]) {
          formData.append(key, versionForm[key]);
        }
      });

      await consentAPI.uploadConsentVersion(formData);
      await fetchVersions();
      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading version:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVersion = async (id) => {
    try {
      await consentAPI.toggleConsentVersion(id);
      await fetchVersions();
    } catch (error) {
      console.error('Error toggling version:', error);
    }
  };

  const handleDeleteVersion = async (id) => {
    if (window.confirm('ต้องการลบ version นี้หรือไม่?')) {
      try {
        await consentAPI.deleteConsentVersion(id);
        await fetchVersions();
      } catch (error) {
        console.error('Error deleting version:', error);
      }
    }
  };

  const resetForm = () => {
    setVersionForm({
      version: '',
      title: '',
      description: '',
      language: 'th',
      userType: 'customer',
      file: null,
      content: ''
    });
    setSelectedVersion(null);
  };

  const getUserTypeInfo = (value) => userTypes.find(t => t.value === value) || userTypes[0];
  const getLanguageInfo = (value) => languages.find(l => l.value === value) || languages[0];

  const filteredVersions = versions.filter(v => {
    const matchesSearch = searchTerm === '' || 
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.version?.includes(searchTerm);
    
    const matchesUserType = filter.userType === 'all' || v.userType === filter.userType;
    const matchesLanguage = filter.language === 'all' || v.language === filter.language;
    const matchesStatus = filter.status === 'all' || 
      (filter.status === 'active' ? v.is_active : !v.is_active);
    
    return matchesSearch && matchesUserType && matchesLanguage && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">จัดการ Consent Versions</h1>
                <p className="text-sm text-gray-500">สร้าง แก้ไข และจัดการเวอร์ชันเอกสารความยินยอม</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTargetingModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
              >
                <Target size={18} />
                <span>Targeting Rules</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>เพิ่ม Version ใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา version..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filter.userType}
              onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">ทุกประเภทผู้ใช้</option>
              {userTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filter.language}
              onChange={(e) => setFilter({ ...filter, language: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">ทุกภาษา</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </select>
          </div>
        </div>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVersions.map((version) => {
            const userType = getUserTypeInfo(version.userType);
            const language = getLanguageInfo(version.language);
            const targetingRule = targetingRules.find(r => r.versionId === version.id);
            
            return (
              <div key={version.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${userType.color}-50 rounded-lg flex items-center justify-center text-xl`}>
                        {userType.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{version.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-mono">
                            v{version.version}
                          </span>
                          <span className="text-xs">{language.flag}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      version.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {version.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {version.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">ประเภทผู้ใช้</p>
                      <p className="text-sm font-medium">{userType.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">การใช้งาน</p>
                      <p className="text-sm font-medium">{(version.usageCount || 0).toLocaleString()} ครั้ง</p>
                    </div>
                  </div>
                  
                  {targetingRule && (
                    <div className="mb-4 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <Target size={14} className="text-purple-600" />
                        <span className="text-xs text-purple-700">
                          Targeted to {userType.label} ({language.label})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVersion(version);
                          setVersionForm({ ...version, file: null });
                          setShowUploadModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="ดูตัวอย่าง"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => window.open(consentAPI.downloadConsentVersion(version.id), '_blank')}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="ดาวน์โหลด"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleVersion(version.id)}
                        className={`p-2 rounded-lg transition-all ${
                          version.is_active
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={version.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        {version.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVersions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่พบ Version</h3>
            <p className="text-sm text-gray-500 mb-6">เริ่มต้นโดยการเพิ่ม version ใหม่</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
            >
              เพิ่ม Version แรก
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
      
      {/* Targeting Modal */}
      {showTargetingModal && <TargetingModal />}
    </div>
  );
  
  // Modal Components (simplified for space)
  function UploadModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 className="text-xl font-bold mb-4">เพิ่ม Version ใหม่</h3>
          {/* Form content */}
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={() => { setShowUploadModal(false); resetForm(); }} className="px-4 py-2 text-gray-600">
              ยกเลิก
            </button>
            <button onClick={handleUploadVersion} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    );
  }

  function TargetingModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h3 className="text-xl font-bold mb-4">Targeting Rules</h3>
          <p className="text-sm text-gray-500 mb-6">กำหนดว่าแต่ละกลุ่มผู้ใช้จะเห็น version ไหน</p>
          {/* Targeting content */}
          <div className="flex justify-end mt-6">
            <button onClick={() => setShowTargetingModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ConsentVersionManager;
