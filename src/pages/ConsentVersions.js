import React, { useState, useEffect } from 'react';
import { Upload, Download, Eye, ToggleLeft, ToggleRight, Trash2, Plus, FileText, Users, Calendar, Globe } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const ConsentVersions = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    version: '',
    language: 'th',
    description: '',
    isActive: false,
    consentFile: null
  });

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/upload/consent-versions`);
      // Handle both response structures  
      const versionsData = response.data?.data?.versions || response.data?.versions || response.data || [];
      setVersions(Array.isArray(versionsData) ? versionsData : []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      // Mock data for development
      setVersions([
        {
          id: 1,
          version: '1.0',
          language: 'th',
          description: 'เวอร์ชันแรก - ข้อตกลงการใช้บริการ',
          isActive: false,
          createdAt: '2024-01-01T00:00:00Z',
          fileName: 'consent_v1.0.pdf',
          fileSize: '245KB',
          usageCount: 1250
        },
        {
          id: 2,
          version: '2.0',
          language: 'th',
          description: 'อัพเดตนโยบายความเป็นส่วนตัว PDPA',
          isActive: true,
          createdAt: '2024-02-15T00:00:00Z',
          fileName: 'consent_v2.0.pdf',
          fileSize: '312KB',
          usageCount: 450
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/html'];
      if (!allowedTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์ PDF, DOC, DOCX หรือ HTML เท่านั้น');
        return;
      }
      setUploadData({ ...uploadData, consentFile: file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.consentFile || !uploadData.version) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const formData = new FormData();
    formData.append('consentFile', uploadData.consentFile);
    formData.append('version', uploadData.version);
    formData.append('language', uploadData.language);
    formData.append('description', uploadData.description);
    formData.append('isActive', uploadData.isActive);

    try {
      await axios.post(`${API_BASE}/upload/consent-version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('อัพโหลดสำเร็จ');
      setShowUploadModal(false);
      fetchVersions();
      setUploadData({
        version: '',
        language: 'th',
        description: '',
        isActive: false,
        consentFile: null
      });
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
      console.error(error);
    }
  };

  const toggleVersion = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE}/upload/consent-version/${id}/toggle`);
      fetchVersions();
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
      console.error(error);
    }
  };

  const deleteVersion = async (id) => {
    if (window.confirm('คุณต้องการลบ consent version นี้หรือไม่?')) {
      try {
        await axios.delete(`${API_BASE}/upload/consent-version/${id}`);
        fetchVersions();
      } catch (error) {
        alert('เกิดข้อผิดพลาด');
        console.error(error);
      }
    }
  };

  const downloadVersion = (id, fileName) => {
    window.open(`${API_BASE}/upload/consent-version/${id}/download`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">จัดการ Consent Versions</h1>
              <p className="text-gray-600 mt-1">จัดการเวอร์ชันของข้อตกลงและเงื่อนไขการใช้บริการ</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>อัพโหลดเวอร์ชันใหม่</span>
            </button>
          </div>
        </div>

        {/* Versions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ภาษา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คำอธิบาย
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ไฟล์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(versions) && versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">v{version.version}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {version.language === 'th' ? 'ไทย' : 'English'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{version.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        <div>{version.fileName}</div>
                        <div className="text-xs text-gray-400">{version.fileSize}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{(version.usageCount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {version.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          ใช้งานอยู่
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          ไม่ใช้งาน
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        {version.createdAt ? new Date(version.createdAt).toLocaleDateString('th-TH') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => downloadVersion(version.id, version.fileName)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="ดาวน์โหลด"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleVersion(version.id, version.isActive)}
                          className="text-gray-600 hover:text-gray-800 transition"
                          title={version.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                        >
                          {version.isActive ? 
                            <ToggleRight className="w-5 h-5 text-green-600" /> : 
                            <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="ลบ"
                          disabled={version.isActive}
                        >
                          <Trash2 className={`w-5 h-5 ${version.isActive ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">อัพโหลด Consent Version ใหม่</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เวอร์ชัน *
                  </label>
                  <input
                    type="text"
                    value={uploadData.version}
                    onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น 2.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ภาษา
                  </label>
                  <select
                    value={uploadData.language}
                    onChange={(e) => setUploadData({ ...uploadData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="th">ภาษาไทย</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="อธิบายการเปลี่ยนแปลงในเวอร์ชันนี้"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ไฟล์ Consent *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.html"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX หรือ HTML</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={uploadData.isActive}
                    onChange={(e) => setUploadData({ ...uploadData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    เปิดใช้งานทันที
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  อัพโหลด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentVersions;
