import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Save, Eye, Download, Plus, Edit2, Trash2, 
  Check, X, FileUp, Users, Globe, Calendar, Hash
} from 'lucide-react';
import { consentAPI } from '../services/api';

const ConsentFormEditor = () => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const userTypes = [
    { value: 'customer', label: 'ลูกค้าทั่วไป', icon: '👤' },
    { value: 'employee', label: 'พนักงาน', icon: '💼' },
    { value: 'partner', label: 'พาร์ทเนอร์', icon: '🤝' }
  ];

  const languages = [
    { value: 'th', label: 'ไทย', flag: '🇹🇭' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const response = await consentAPI.getConsentVersions();
      const data = Array.isArray(response.data) ? response.data : [];
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
      // Use mock data if API fails
      setVersions([
        {
          id: 1,
          version: '1.0',
          userType: 'customer',
          language: 'th',
          description: 'เวอร์ชันแรก - ลูกค้าทั่วไป',
          isActive: true,
          createdAt: new Date().toISOString(),
          fileName: 'consent_v1.0_customer_th.pdf',
          fileSize: '125 KB'
        },
        {
          id: 2,
          version: '1.0',
          userType: 'employee',
          language: 'th',
          description: 'เวอร์ชันแรก - พนักงาน',
          isActive: true,
          createdAt: new Date().toISOString(),
          fileName: 'consent_v1.0_employee_th.pdf',
          fileSize: '98 KB'
        }
      ]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      if (file.type === 'text/plain' || file.type === 'text/html') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormContent(event.target.result);
        };
        reader.readAsText(file);
      } else {
        setFormContent(`ไฟล์: ${file.name}\nขนาด: ${(file.size / 1024).toFixed(2)} KB\nประเภท: ${file.type}`);
      }
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedVersion) return;
    
    setLoading(true);
    try {
      const versionData = {
        ...selectedVersion,
        content: formContent,
        fileName: uploadedFile?.name || selectedVersion.fileName,
        fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(2)} KB` : selectedVersion.fileSize,
        updatedAt: new Date().toISOString()
      };

      if (selectedVersion.id) {
        // Update existing version
        await consentAPI.updateConsentVersion(selectedVersion.id, versionData);
      } else {
        // Create new version
        const newVersion = {
          ...versionData,
          version: generateNewVersion(),
          createdAt: new Date().toISOString()
        };
        await consentAPI.createConsentVersion(newVersion);
      }
      
      fetchVersions();
      setShowEditor(false);
      setSelectedVersion(null);
      setFormContent('');
      setUploadedFile(null);
      alert('บันทึกเวอร์ชันสำเร็จ');
    } catch (error) {
      console.error('Error saving version:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const generateNewVersion = () => {
    const maxVersion = Math.max(...versions.map(v => parseFloat(v.version)), 0);
    return `${(maxVersion + 0.1).toFixed(1)}`;
  };

  const handleDeleteVersion = async (id) => {
    if (window.confirm('ต้องการลบเวอร์ชันนี้หรือไม่?')) {
      try {
        await consentAPI.deleteConsentVersion(id);
        fetchVersions();
      } catch (error) {
        console.error('Error deleting version:', error);
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  const handleToggleActive = async (version) => {
    try {
      await consentAPI.updateConsentVersion(version.id, {
        ...version,
        isActive: !version.isActive
      });
      fetchVersions();
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" />
                จัดการเนื้อหา Consent Forms
              </h1>
              <p className="text-gray-600 mt-1">อัพโหลดและจัดการเนื้อหาฟอร์มความยินยอมสำหรับแต่ละประเภทผู้ใช้</p>
            </div>
            <button
              onClick={() => {
                setSelectedVersion({
                  userType: 'customer',
                  language: 'th',
                  description: '',
                  isActive: true
                });
                setShowEditor(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              เพิ่มเวอร์ชันใหม่
            </button>
          </div>
        </div>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.map((version) => {
            const userType = userTypes.find(u => u.value === version.userType);
            const language = languages.find(l => l.value === version.language);
            
            return (
              <div key={version.id} className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{userType?.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {userType?.label} {language?.flag}
                      </h3>
                      <p className="text-sm text-gray-500">v{version.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(version)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        version.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {version.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{version.description}</p>
                  {version.fileName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FileText size={14} />
                      <span>{version.fileName}</span>
                      {version.fileSize && <span>({version.fileSize})</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{new Date(version.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedVersion(version);
                      setFormContent(version.content || '');
                      setShowEditor(true);
                    }}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => window.open(`/api/consent/version/${version.id}/preview`, '_blank')}
                    className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    ดูตัวอย่าง
                  </button>
                  <button
                    onClick={() => handleDeleteVersion(version.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {selectedVersion?.id ? 'แก้ไขเวอร์ชัน' : 'สร้างเวอร์ชันใหม่'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ประเภทผู้ใช้
                    </label>
                    <select
                      value={selectedVersion?.userType || 'customer'}
                      onChange={(e) => setSelectedVersion({...selectedVersion, userType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {userTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ภาษา
                    </label>
                    <select
                      value={selectedVersion?.language || 'th'}
                      onChange={(e) => setSelectedVersion({...selectedVersion, language: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <input
                    type="text"
                    value={selectedVersion?.description || ''}
                    onChange={(e) => setSelectedVersion({...selectedVersion, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น เวอร์ชันสำหรับลูกค้าทั่วไป - อัพเดทข้อกำหนดใหม่"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อัพโหลดไฟล์เนื้อหา
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".txt,.html,.pdf,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <FileUp className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-600">
                        {uploadedFile ? uploadedFile.name : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        รองรับ: TXT, HTML, PDF, DOC, DOCX
                      </span>
                    </label>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เนื้อหา Consent Form
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-64"
                    placeholder="วางเนื้อหา consent form ที่นี่..."
                  />
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setSelectedVersion(null);
                    setFormContent('');
                    setUploadedFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveVersion}
                  disabled={loading || !formContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentFormEditor;
