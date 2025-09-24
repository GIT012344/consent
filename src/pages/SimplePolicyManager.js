import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Copy, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SimplePolicyManager = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editFormData, setEditFormData] = useState({
    version: '',
    title: '',
    content: '',
    effective_date: '',
    expiry_date: '',
    is_mandatory: true,
    enforce_mode: 'strict'
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      // Use the correct endpoint
      const response = await axios.get(`${API_BASE_URL}/api/simple-policy`);
      console.log('Policy response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        setPolicies(response.data.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setPolicies(response.data.data);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setEditFormData({
      version: policy.version,
      title: policy.title,
      content: policy.content,
      effective_date: policy.effective_date ? policy.effective_date.split('T')[0] : '',
      expiry_date: policy.expiry_date ? policy.expiry_date.split('T')[0] : '',
      is_mandatory: policy.is_mandatory,
      enforce_mode: policy.enforce_mode || 'strict'
    });
    setShowEditModal(true);
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that backend expects
      const updateData = {
        version: editFormData.version,
        title: editFormData.title,
        content: editFormData.content,
        language: selectedPolicy.language, // Keep original language
        effective_date: editFormData.effective_date,
        expiry_date: editFormData.expiry_date || null
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/api/simple-policy/${selectedPolicy.id}`,
        updateData
      );
      
      if (response.data.success) {
        alert('Policy updated successfully!');
        setShowEditModal(false);
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      alert('Failed to update policy');
    }
  };

  const handleDelete = async (policy) => {
    if (!window.confirm(`Are you sure you want to delete this policy?\n\nUser Type: ${policy.user_type}\nLanguage: ${policy.language}\nVersion: ${policy.version}`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/simple-policy/${policy.id}`);
      if (response.data.success) {
        alert('Policy deleted successfully!');
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      if (error.response?.status === 400) {
        alert('Cannot delete this policy because it has been used in consent records.');
      } else {
        alert('Failed to delete policy');
      }
    }
  };

  const handlePreview = (policy) => {
    setSelectedPolicy(policy);
    setShowPreviewModal(true);
  };

  const togglePolicyStatus = async (policyId, currentStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/simple-policy/${policyId}/toggle`,
        { is_active: !currentStatus }
      );
      if (response.data.success) {
        fetchPolicies();
        // Show success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        message.textContent = `✓ สถานะเปลี่ยนเป็น ${!currentStatus ? 'Active' : 'Inactive'}`;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
      }
    } catch (error) {
      console.error('Error toggling policy status:', error);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleCopyLink = (policy) => {
    // Fix language code mapping - handle all formats correctly
    let langCode = 'en'; // default
    if (policy.language === 'th-TH' || policy.language === 'th' || policy.language === 'ภาษาไทย') {
      langCode = 'th';
    } else if (policy.language === 'en-US' || policy.language === 'en' || policy.language === 'English') {
      langCode = 'en';
    }
    
    let link = '';
    
    // Generate correct link based on user type - include policy_id for uniqueness
    if (policy.user_type === 'customer') {
      // Customer goes to language selection first with policy_id
      link = `${window.location.origin}/consent/select-language?policy_id=${policy.id}`;
    } else {
      // Other user types go directly to form with language and policy_id
      link = `${window.location.origin}/consent/${policy.user_type}?lang=${langCode}&policy_id=${policy.id}`;
    }
    
    navigator.clipboard.writeText(link);
    
    // Show success message
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    message.textContent = '✓ คัดลอกลิงก์แล้ว!';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  };

  const filteredPolicies = policies.filter(p => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !p.user_type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Simple language filter
    if (filterLanguage && p.language !== filterLanguage) {
      return false;
    }
    if (filterUserType && p.user_type !== filterUserType) return false;
    return true;
  });

  const uniqueUserTypes = [...new Set(policies.map(p => p.user_type))];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Policy Management Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Policy Management</h1>
            <button
              onClick={() => navigate('/admin/create-policy')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              สร้าง Policy ใหม่
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="">ทุกภาษา</option>
              <option value="th">ภาษาไทย</option>
              <option value="en">English</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
            >
              <option value="">ทุก User Type</option>
              {uniqueUserTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              พบ {filteredPolicies.length} รายการ
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ภาษา</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สร้าง</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPolicies.map((policy) => {
                  // Fix language code mapping - handle all formats correctly
                  let langCode = 'en'; // default
                  if (policy.language === 'th-TH' || policy.language === 'th' || policy.language === 'ภาษาไทย') {
                    langCode = 'th';
                  } else if (policy.language === 'en-US' || policy.language === 'en' || policy.language === 'English') {
                    langCode = 'en';
                  }
                  
                  let link = '';
                  let fullLink = '';
                  
                  // Generate correct link based on user type - include policy_id for uniqueness
                  if (policy.user_type === 'customer') {
                    // Customer เลือกภาษาเองที่หน้าแรก - include policy_id
                    link = `/consent/select-language?policy_id=${policy.id}`;
                    fullLink = `${window.location.origin}/consent/select-language?policy_id=${policy.id}`;
                  } else {
                    // UserType อื่นๆ ใช้ลิงก์ตรงพร้อมภาษาและ policy_id
                    link = `/consent/${policy.user_type}?lang=${langCode}&policy_id=${policy.id}`;
                    fullLink = `${window.location.origin}/consent/${policy.user_type}?lang=${langCode}&policy_id=${policy.id}`;
                  }
                  
                  return (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {policy.user_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {policy.language === 'th-TH' || policy.language === 'th' ? '🇹🇭 ไทย' : 
                         policy.language === 'en-US' || policy.language === 'en' ? 'English' : 
                         policy.language}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{policy.version}</td>
                      <td className="px-4 py-3 text-sm">{policy.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">{fullLink}</code>
                            <button
                              onClick={() => handleCopyLink(policy)}
                              className="text-gray-500 hover:text-gray-700"
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          {policy.user_type === 'customer' && (
                            <div className="text-xs text-gray-500 italic">
                              ลูกค้าจะเลือกภาษาเองที่หน้าแรก
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePolicyStatus(policy.id, policy.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                            policy.is_active 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {policy.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(policy.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handlePreview(policy)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(policy)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(policy)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPolicies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบ Policy ที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">แก้ไข Policy</h2>
              <p className="text-sm text-gray-600 mt-1">
                User Type: {selectedPolicy.user_type} | ภาษา: {selectedPolicy.language === 'th-TH' ? 'ไทย' : 'English'}
              </p>
            </div>
            
            <form onSubmit={handleUpdatePolicy} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={editFormData.version}
                  onChange={(e) => setEditFormData({...editFormData, version: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อ
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เนื้อหา
                </label>
                <div className="border rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={editFormData.content}
                    onChange={(value) => setEditFormData({...editFormData, content: value})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่เริ่มใช้
                  </label>
                  <input
                    type="date"
                    value={editFormData.effective_date}
                    onChange={(e) => setEditFormData({...editFormData, effective_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันหมดอายุ (ถ้ามี)
                  </label>
                  <input
                    type="date"
                    value={editFormData.expiry_date}
                    onChange={(e) => setEditFormData({...editFormData, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedPolicy.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Version {selectedPolicy.version} | {selectedPolicy.language === 'th-TH' ? 'ภาษาไทย' : 'English'}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
                {selectedPolicy.content && selectedPolicy.content.includes('<') && selectedPolicy.content.includes('>') ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                    className="policy-content whitespace-pre-wrap [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>p]:whitespace-pre-wrap [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>li]:mb-2 [&>li]:whitespace-pre-wrap [&>strong]:font-bold [&>em]:italic [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:whitespace-pre-wrap [&>hr]:my-6 [&>hr]:border-gray-300 [&_*]:whitespace-pre-wrap"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{selectedPolicy.content}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePolicyManager;
