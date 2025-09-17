import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileCheck, TrendingUp, Download, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    totalConsents: 0,
    todayConsents: 0,
    activeUsers: 0,
    conversionRate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/statistics', {
        params: dateRange
      });
      setStats(response.data.stats || {
        totalConsents: 0,
        todayConsents: 0,
        activeUsers: 0,
        conversionRate: 0
      });
      setChartData(response.data.chartData || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Mock data
      setStats({
        totalConsents: 1234,
        todayConsents: 45,
        activeUsers: 892,
        conversionRate: 72.5
      });
      setChartData([
        { date: '2024-01-01', count: 30 },
        { date: '2024-01-02', count: 45 },
        { date: '2024-01-03', count: 38 },
        { date: '2024-01-04', count: 52 },
        { date: '2024-01-05', count: 41 },
        { date: '2024-01-06', count: 48 },
        { date: '2024-01-07', count: 45 }
      ]);
    }
  };

  const exportData = async (format) => {
    try {
      const response = await axios.post('http://localhost:3000/api/admin/export', {
        format,
        ...dateRange
      });
      // Handle download
      const blob = new Blob([response.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consent-data-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const statCards = [
    {
      title: 'Total Consents',
      value: stats.totalConsents,
      icon: FileCheck,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: "Today's Consents",
      value: stats.todayConsents,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+2.5%'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Statistics Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => exportData('csv')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => exportData('json')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={fetchStatistics}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Consent Trends</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((data, index) => {
            const maxCount = Math.max(...chartData.map(d => d.count));
            const height = (data.count / maxCount) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
                <span className="text-xs mt-2 text-gray-500">
                  {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-semibold">{data.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Consent Activity</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead className="text-left text-sm text-gray-500">
              <tr>
                <th className="pb-2">User</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Version</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t">
                <td className="py-2">John Doe</td>
                <td className="py-2">Customer</td>
                <td className="py-2">v1.0</td>
                <td className="py-2">2 mins ago</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Jane Smith</td>
                <td className="py-2">Staff</td>
                <td className="py-2">v1.1</td>
                <td className="py-2">5 mins ago</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Bob Johnson</td>
                <td className="py-2">Partner</td>
                <td className="py-2">v1.0</td>
                <td className="py-2">10 mins ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
