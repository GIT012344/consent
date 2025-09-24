import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { Search, Filter, Trash2, Power, Eye, Download, CheckCircle, XCircle, Calendar, User, Globe, FileText } from 'lucide-react';

const AdminConsentManager = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    userType: '',
    language: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedConsents, setSelectedConsents] = useState([]);
  const [showDetails, setShowDetails] = useState(null);
  const [userTypes, setUserTypes] = useState([]);

  useEffect(() => {
    fetchConsents();
  }, []);

  useEffect(() => {
    // Update user types when consents change
    const uniqueTypes = [...new Set(consents.map(c => c.user_type).filter(Boolean))];
    setUserTypes(uniqueTypes.sort());
  }, [consents]);


  const fetchConsents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/consent/records`);
      console.log('Consent records response:', response.data);
      
      if (response.data) {
        // Handle both success response and direct data
        const records = response.data.data || response.data.records || [];
        console.log('Records from API:', records);
        
        // Map the data to ensure consistent field names
        const mappedRecords = records.map(record => ({
          id: record.id,
          name: record.name_surname || record.name || 'N/A',
          email: '', // No email field in database
          phone: '', // No phone field in database
          id_passport: record.id_passport || '',
          user_type: record.user_type || 'customer',
          consent_version: record.consent_version || '1.0',
          language: record.consent_language || 'th',
          status: record.is_active !== false ? 'active' : 'inactive',
          created_at: record.created_at || record.created_date,
          policy_title: record.policy_title || 'N/A' // Use actual policy_title from database
        }));
        
        console.log('Mapped records:', mappedRecords);
        setConsents(mappedRecords);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`${API_BASE_URL}/api/consent/records/${id}/status`, {
        status: newStatus
      });
      
      setConsents(consents.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this consent record?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/consent/records/${id}`);
      setConsents(consents.filter(c => c.id !== id));
      setSelectedConsents(selectedConsents.filter(sid => sid !== id));
    } catch (error) {
      console.error('Error deleting consent:', error);
      alert('Failed to delete consent record');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConsents.length === 0) {
      alert('Please select consent records to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedConsents.length} consent records?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedConsents.map(id => 
          axios.delete(`${API_BASE_URL}/api/consent/records/${id}`)
        )
      );
      
      setConsents(consents.filter(c => !selectedConsents.includes(c.id)));
      setSelectedConsents([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete some consent records');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedConsents(filteredConsents.map(c => c.id));
    } else {
      setSelectedConsents([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedConsents.includes(id)) {
      setSelectedConsents(selectedConsents.filter(sid => sid !== id));
    } else {
      setSelectedConsents([...selectedConsents, id]);
    }
  };

  const filteredConsents = consents.filter(consent => {
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!consent.name?.toLowerCase().includes(search) &&
          !consent.email?.toLowerCase().includes(search) &&
          !consent.phone?.includes(search)) {
        return false;
      }
    }

    // User type filter
    if (filters.userType && consent.user_type !== filters.userType) {
      return false;
    }

    // Language filter
    if (filters.language && consent.language !== filters.language) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const consentDate = new Date(consent.created_at);
      const fromDate = new Date(filters.dateFrom);
      if (consentDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const consentDate = new Date(consent.created_at);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (consentDate > toDate) return false;
    }

    return true;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'User Type', 'Title', 'Version', 'Language', 'Status', 'Date'];
    const rows = filteredConsents.map(c => [
      c.id,
      c.name || '',
      c.email || '',
      c.phone || '',
      c.user_type || '',
      c.policy_title || '',
      c.consent_version || '',
      c.language || '',
      c.status || '',
      new Date(c.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Consent Records Management</h1>
        <p className="text-gray-600">Manage and monitor user consent records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ประเภททั้งหมด</option>
            {userTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ภาษาทั้งหมด</option>
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From Date"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To Date"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Found {filteredConsents.length} records
            {selectedConsents.length > 0 && ` (${selectedConsents.length} selected)`}
          </div>
          <div className="flex gap-2">
            {selectedConsents.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedConsents.length === filteredConsents.length && filteredConsents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขบัตร/Passport</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredConsents.map(consent => (
                <tr key={consent.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedConsents.includes(consent.id)}
                      onChange={() => handleSelectOne(consent.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{consent.name || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">{consent.id_passport || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {consent.user_type || 'customer'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {consent.policy_title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <span className="font-medium">v{consent.consent_version || '1.0'}</span>
                      <span className="text-gray-500 ml-2">({consent.language || 'th'})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(consent.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setShowDetails(consent)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredConsents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No consent records found
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Consent Record Details</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">ชื่อ-นามสกุล</label>
                  <p className="font-medium">{showDetails.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">เลขบัตร/Passport</label>
                  <p className="font-medium">{showDetails.id_passport || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">ประเภทผู้ใช้</label>
                  <p className="font-medium">{showDetails.user_type || 'customer'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Version</label>
                  <p className="font-medium">{showDetails.consent_version || '1.0'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">ภาษา</label>
                  <p className="font-medium">{showDetails.language || 'th'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">สถานะ</label>
                  <p className="font-medium">{showDetails.status || 'active'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">วันที่ยินยอม</label>
                  <p className="font-medium">{new Date(showDetails.created_at).toLocaleString('th-TH')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDetails(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsentManager;
