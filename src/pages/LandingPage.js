import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, FileText, ArrowRight, UserCog } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              ระบบจัดการ
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> ความยินยอม</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              จัดการความยินยอมในการใช้ข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
            </p>
            
            {/* Main Action */}
            <div className="flex justify-center max-w-md mx-auto">
              <button
                onClick={() => navigate('/register')}
                className="w-full px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center group text-xl"
              >
                <FileText className="mr-3 h-7 w-7" />
                <span>ให้ความยินยอม</span>
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Admin Link */}
            <div className="mt-12">
              <button
                onClick={() => navigate('/admin/login')}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all inline-flex items-center"
              >
                <UserCog className="mr-2 h-5 w-5" />
                สำหรับผู้ดูแลระบบ
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LandingPage;
