import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const AdminUserTypeManager = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ type_name: '', description: '' });
  const [newUserType, setNewUserType] = useState({ type_name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/user-types');
      if (response.data && response.data.success) {
        setUserTypes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user types:', error);
      // Use default types if API fails
      setUserTypes([
        { id: 1, type_name: 'customer', description: 'ลูกค้าทั่วไป' },
        { id: 2, type_name: 'employee', description: 'พนักงาน' },
        { id: 3, type_name: 'partner', description: 'พาร์ทเนอร์' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newUserType.type_name.trim()) {
      alert('กรุณากรอกชื่อประเภทผู้ใช้');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/user-types', newUserType);
      if (response.data && response.data.success) {
        alert('เพิ่มประเภทผู้ใช้สำเร็จ');
        setNewUserType({ type_name: '', description: '' });
        setShowAddForm(false);
        fetchUserTypes();
      }
    } catch (error) {
      console.error('Error adding user type:', error);
      alert('ไม่สามารถเพิ่มประเภทผู้ใช้ได้');
    }
  };

  const handleEdit = (userType) => {
    setEditingId(userType.id);
    setEditForm({
      type_name: userType.type_name,
      description: userType.description || ''
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(`http://localhost:4000/api/user-types/${id}`, editForm);
      if (response.data && response.data.success) {
        alert('อัปเดตประเภทผู้ใช้สำเร็จ');
        setEditingId(null);
        fetchUserTypes();
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      alert('ไม่สามารถอัปเดตประเภทผู้ใช้ได้');
    }
  };

  const handleDelete = async (id, typeName) => {
    if (!window.confirm(`ต้องการลบประเภทผู้ใช้ "${typeName}" หรือไม่?`)) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:4000/api/user-types/${id}`);
      if (response.data && response.data.success) {
        alert('ลบประเภทผู้ใช้สำเร็จ');
        fetchUserTypes();
      }
    } catch (error) {
      console.error('Error deleting user type:', error);
      alert('ไม่สามารถลบประเภทผู้ใช้ได้');
    }
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">จัดการประเภทผู้ใช้</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            เพิ่มประเภทผู้ใช้
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">เพิ่มประเภทผู้ใช้ใหม่</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ชื่อประเภท (เช่น customer, employee)"
                value={newUserType.type_name}
                onChange={(e) => setNewUserType({...newUserType, type_name: e.target.value})}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="คำอธิบาย"
                value={newUserType.description}
                onChange={(e) => setNewUserType({...newUserType, description: e.target.value})}
                className="px-3 py-2 border rounded"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewUserType({ type_name: '', description: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* User Types Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อประเภท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คำอธิบาย
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : userTypes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    ไม่มีข้อมูลประเภทผู้ใช้
                  </td>
                </tr>
              ) : (
                userTypes.map((userType) => (
                  <tr key={userType.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === userType.id ? (
                        <input
                          type="text"
                          value={editForm.type_name}
                          onChange={(e) => setEditForm({...editForm, type_name: e.target.value})}
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="font-medium">{userType.type_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === userType.id ? (
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="px-2 py-1 border rounded w-full"
                        />
                      ) : (
                        <span className="text-gray-600">{userType.description || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === userType.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(userType.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(userType)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(userType.id, userType.type_name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default AdminUserTypeManager;
