import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  Filter, 
  Users, 
  FileText, 
  Globe, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { consentAPI } from '../services/api';
import { 
  formatDate, 
  formatDateShort, 
  downloadFile, 
  generateExportFilename,
  getConsentTypeLabel,
  getLanguageLabel,
  getConsentTypeColor,
  getLanguageColor,
  processStatsData
} from '../utils/helpers';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    language: '',
    startDate: '',
    endDate: ''
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRecords();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadRecords()]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await consentAPI.getStats();
      if (response.success) {
        setStats(processStatsData(response.data));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecords = async () => {
    try {
      const response = await consentAPI.getConsentList(filters);
      if (response.success) {
        setRecords(response.data.records || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when other filters change
    }));
  };

  const handleExport = async (type) => {
    setExportLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let blob;
      let filename;

      if (type === 'excel') {
        blob = await consentAPI.exportExcel({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        filename = generateExportFilename('xlsx', filters.startDate, filters.endDate);
      } else if (type === 'csv') {
        blob = await consentAPI.exportCSV({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        filename = generateExportFilename('csv', filters.startDate, filters.endDate);
      }

      downloadFile(blob, filename);
      setMessage({
        type: 'success',
        text: `Export ${type.toUpperCase()} สำเร็จ`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `เกิดข้อผิดพลาดในการ Export: ${error.message}`
      });
    } finally {
      setExportLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-600 p-2 rounded-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลความยินยอม</h1>
              <p className="text-gray-600">Admin Dashboard</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`alert-${message.type} mb-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
                <button
                  onClick={clearMessage}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {stats.byType.map((item) => (
              <div key={item.type} className="card">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.count.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters and Export */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Filters */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>ตัวกรอง</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ค้นหา
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="input-field"
                    placeholder="ชื่อ หรือ เลขบัตร"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภท
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="select-field"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="customer">ลูกค้า</option>
                    <option value="employee">พนักงาน</option>
                    <option value="partner">พันธมิตร</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ภาษา
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="select-field"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="th">ไทย</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนต่อหน้า
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="select-field"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export ข้อมูล</span>
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {exportLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span>Export Excel</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  disabled={exportLoading}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  {exportLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span>Export CSV</span>
                </button>

                <p className="text-xs text-gray-500">
                  * Export จะรวมข้อมูลตามช่วงวันที่ที่เลือก
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              รายการข้อมูลความยินยอม ({pagination.totalRecords?.toLocaleString() || 0} รายการ)
            </h3>
          </div>

          {records.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ข้อมูลส่วนบุคคล
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เลขบัตร/Passport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ภาษา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.title} {record.name_surname}
                            </div>
                            <div className="text-sm text-gray-500">ID: {record.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {record.id_passport_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsentTypeColor(record.consent_type)}`}>
                            {getConsentTypeLabel(record.consent_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(record.consent_language)}`}>
                            {getLanguageLabel(record.consent_language)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateShort(record.created_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {record.title} {record.name_surname}
                        </h4>
                        <p className="text-sm text-gray-500 font-mono">
                          {record.id_passport_number}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">#{record.id}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsentTypeColor(record.consent_type)}`}>
                        {getConsentTypeLabel(record.consent_type)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(record.consent_language)}`}>
                        {getLanguageLabel(record.consent_language)}
                      </span>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {formatDateShort(record.created_date)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    แสดง {((pagination.currentPage - 1) * pagination.recordsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.recordsPerPage, pagination.totalRecords)} จาก {pagination.totalRecords.toLocaleString()} รายการ
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>ก่อนหน้า</span>
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      หน้า {pagination.currentPage} จาก {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="btn-secondary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>ถัดไป</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
