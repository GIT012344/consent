import React, { useState, useEffect } from 'react';
import { Users, FileText, Settings, Save, X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const ConsentVersionTargeting = () => {
  const [versions, setVersions] = useState([]);
  const [targetRules, setTargetRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleType: 'specific', // specific, group, default
    targetValue: '',
    versionId: '',
    description: ''
  });

  useEffect(() => {
    fetchVersions();
    fetchTargetRules();
  }, []);

  const fetchVersions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/upload/consent-versions`);
      // Handle both response structures
      const versionsData = response.data?.data?.versions || response.data?.versions || response.data || [];
      setVersions(Array.isArray(versionsData) ? versionsData : []);
    } catch (error) {
      // Mock data
      setVersions([
        { id: 1, version: '1.0', language: 'th', description: 'เวอร์ชันมาตรฐาน' },
        { id: 2, version: '2.0', language: 'th', description: 'PDPA Compliant' },
        { id: 3, version: '3.0', language: 'th', description: 'Enterprise Edition' }
      ]);
    }
  };

  const fetchTargetRules = async () => {
    try {
      const response = await axios.get(`${API_BASE}/consent/targeting-rules`);
      setTargetRules(response.data);
    } catch (error) {
      // Mock data
      setTargetRules([
        {
          id: 1,
          ruleType: 'specific',
          targetValue: '1234567890123',
          versionId: 3,
          versionName: 'v3.0',
          description: 'ลูกค้า VIP - ใช้ Enterprise Edition',
          priority: 1
        },
        {
          id: 2,
          ruleType: 'group',
          targetValue: 'corporate',
          versionId: 2,
          versionName: 'v2.0',
          description: 'ลูกค้าองค์กร - ใช้ PDPA Version',
          priority: 2
        },
        {
          id: 3,
          ruleType: 'default',
          targetValue: '*',
          versionId: 1,
          versionName: 'v1.0',
          description: 'ลูกค้าทั่วไป - ใช้ Standard Version',
          priority: 99
        }
      ]);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.targetValue || !newRule.versionId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      await axios.post(`${API_BASE}/consent/targeting-rule`, newRule);
      fetchTargetRules();
      setShowAddRule(false);
      setNewRule({
        ruleType: 'specific',
        targetValue: '',
        versionId: '',
        description: ''
      });
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const deleteRule = async (id) => {
    if (window.confirm('ต้องการลบกฎนี้หรือไม่?')) {
      try {
        await axios.delete(`${API_BASE}/consent/targeting-rule/${id}`);
        fetchTargetRules();
      } catch (error) {
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const getRuleTypeLabel = (type) => {
    switch(type) {
      case 'specific': return 'เฉพาะบุคคล';
      case 'group': return 'กลุ่มลูกค้า';
      case 'default': return 'ค่าเริ่มต้น';
      default: return type;
    }
  };

  const getRuleTypeColor = (type) => {
    switch(type) {
      case 'specific': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      case 'default': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Version Targeting Rules
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            กำหนดว่าลูกค้าแต่ละคน/กลุ่มควรใช้ Consent Version ใด
          </p>
        </div>
        <button
          onClick={() => setShowAddRule(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มกฎใหม่</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เป้าหมาย
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version ที่ใช้
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คำอธิบาย
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {targetRules.sort((a, b) => a.priority - b.priority).map((rule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {rule.priority}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRuleTypeColor(rule.ruleType)}`}>
                    {getRuleTypeLabel(rule.ruleType)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {rule.ruleType === 'specific' && <Users className="w-4 h-4 text-gray-400 mr-2" />}
                    <span className="text-sm text-gray-900 font-mono">
                      {rule.targetValue}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {rule.versionName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {rule.description}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    disabled={rule.ruleType === 'default'}
                  >
                    <Trash2 className={`w-5 h-5 ${rule.ruleType === 'default' ? 'opacity-30' : ''}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">เพิ่มกฎการกำหนด Version</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทกฎ *
                </label>
                <select
                  value={newRule.ruleType}
                  onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="specific">เฉพาะบุคคล (ระบุ ID/Passport)</option>
                  <option value="group">กลุ่มลูกค้า</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newRule.ruleType === 'specific' ? 'ID/Passport' : 'ชื่อกลุ่ม'} *
                </label>
                <input
                  type="text"
                  value={newRule.targetValue}
                  onChange={(e) => setNewRule({ ...newRule, targetValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={newRule.ruleType === 'specific' ? 'เลขบัตรประชาชน/Passport' : 'เช่น corporate, vip'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consent Version *
                </label>
                <select
                  value={newRule.versionId}
                  onChange={(e) => setNewRule({ ...newRule, versionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือก Version</option>
                  {Array.isArray(versions) && versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version} - {v.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="อธิบายเหตุผลในการกำหนดกฎนี้"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRule(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                <X className="w-4 h-4 inline mr-1" />
                ยกเลิก
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4 inline mr-1" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📘 วิธีการทำงาน:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• ระบบจะตรวจสอบกฎตามลำดับ Priority (น้อย → มาก)</li>
          <li>• <strong>เฉพาะบุคคล:</strong> ตรวจสอบ ID/Passport ตรงกันหรือไม่</li>
          <li>• <strong>กลุ่มลูกค้า:</strong> ตรวจสอบว่าอยู่ในกลุ่มที่กำหนดหรือไม่</li>
          <li>• <strong>ค่าเริ่มต้น:</strong> ใช้เมื่อไม่ตรงกับกฎใดๆ</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsentVersionTargeting;
