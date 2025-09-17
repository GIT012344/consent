import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, Settings, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const AdminConsentDashboard = () => {
  const navigate = useNavigate();
  const [totalConsents, setTotalConsents] = useState(0);
  const [activePolicies, setActivePolicies] = useState(0);
  const [todayConsents, setTodayConsents] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch consent records
      const consentRes = await axios.get(`${API_BASE_URL}/consent/records`);
      console.log('Consent records response:', consentRes.data);
      
      if (consentRes.data && consentRes.data.data) {
        const records = consentRes.data.data;
        setTotalConsents(records.length);
        
        // Count today's consents
        const today = new Date().toDateString();
        const todayCount = records.filter(c => {
          const date = c.created_at || c.consent_date || c.created_date;
          return date && new Date(date).toDateString() === today;
        }).length;
        setTodayConsents(todayCount);
      }
      
      // Fetch active policies
      const policyRes = await axios.get(`${API_BASE_URL}/simple-policy`);
      console.log('Policy response:', policyRes.data);
      
      if (policyRes.data && policyRes.data.data) {
        const activeCount = policyRes.data.data.filter(p => p.is_active !== false).length;
        setActivePolicies(activeCount);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Try alternative endpoints if main ones fail
      try {
        const recordsRes = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`);
        if (recordsRes.data && recordsRes.data.data) {
          setTotalConsents(recordsRes.data.data.total || 0);
          setTodayConsents(recordsRes.data.data.today || 0);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'สร้าง Policy ใหม่',
      description: 'สร้างนโยบายความเป็นส่วนตัวใหม่',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => navigate('/admin/create-policy')
    },
    {
      title: 'จัดการ Policies',
      description: 'ดูและแก้ไข policies ทั้งหมด',
      icon: Settings,
      color: 'bg-green-500',
      action: () => navigate('/admin/policies')
    },
    {
      title: 'ดู Consent Records',
      description: 'ตรวจสอบประวัติการยินยอม',
      icon: Shield,
      color: 'bg-purple-500',
      action: () => navigate('/admin/consents')
    },
    {
      title: 'Export ข้อมูล',
      description: 'ดาวน์โหลดข้อมูลเป็น CSV',
      icon: ExternalLink,
      color: 'bg-orange-500',
      action: () => handleExport('csv')
    }
  ];

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consent/records`);
      if (response.data.success && response.data.data) {
        const csvContent = convertToCSV(response.data.data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consents_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const convertToCSV = (data) => {
    const headers = ['ID', 'Name', 'ID/Passport', 'User Type', 'Language', 'Version', 'Date'];
    const rows = data.map(item => [
      item.id,
      item.name_surname || '',
      item.id_passport || '',
      item.user_type || 'customer',
      item.consent_language || 'th',
      item.consent_version || '1.0',
      new Date(item.created_at || item.created_date).toLocaleDateString()
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">ภาพรวมระบบจัดการความยินยอม</p>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">TOTAL</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalConsents.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Total Consents</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">ACTIVE</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activePolicies}</p>
            <p className="text-sm text-gray-500 mt-1">Active Policies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">TODAY</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{todayConsents}</p>
            <p className="text-sm text-gray-500 mt-1">New Today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className={`inline-flex p-3 rounded-lg ${action.color} bg-opacity-10 mb-3`}>
                    <Icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsentDashboard;
