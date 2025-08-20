import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, FileText, Settings, LogOut, Menu, X, 
  BarChart2, Shield, Download, ChevronDown, Upload
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'ภาพรวมระบบ'
    },
    { 
      path: '/admin/consents', 
      label: 'Consent Data', 
      icon: Users,
      description: 'ข้อมูลความยินยอม'
    },
    { 
      path: '/admin/consent-versions', 
      label: 'Version Management', 
      icon: FileText,
      description: 'จัดการเวอร์ชัน'
    },
    { 
      path: '/admin/version-targeting', 
      label: 'Version Targeting', 
      icon: Settings,
      description: 'กำหนดเวอร์ชันตามกลุ่ม'
    },
    { 
      path: '/admin/reports', 
      label: 'Reports & Export', 
      icon: Download,
      description: 'รายงานและส่งออกข้อมูล'
    },
    { 
      path: '/admin/security', 
      label: 'Security Settings', 
      icon: Shield,
      description: 'ตั้งค่าความปลอดภัย'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Admin Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 hover:text-white transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <div className="ml-3">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">A</span>
              </div>
              {sidebarOpen && (
                <>
                  <div className="ml-3 flex-1 text-left">
                    <div className="text-sm font-medium">Admin User</div>
                    <div className="text-xs text-gray-400">admin@consent.com</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Consent Management System - Admin
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="relative">
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
